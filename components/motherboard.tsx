// MotherboardAccurate.tsx
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Html,
  useProgress,
  PerspectiveCamera,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from 'react-router-dom';

/*
  Highly-detailed primitives-only motherboard model.
  - Face of the board is parallel to screen (rotated X by 90deg internally)
  - Camera locked (no orbit controls) so layout looks consistent
  - Contains many primitives positioned to match the provided image layout
*/

/* ---------- Loader ---------- */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: "white", fontFamily: "sans-serif" }}>
        {Math.round(progress)}% loading
      </div>
    </Html>
  );
}

/* ---------- Low-level parts ---------- */

function PCB({ width = 14, depth = 12, thickness = 0.08 }) {
  return (
    <group>
      {/* Main PCB substrate - proper green color */}
      <mesh receiveShadow>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial 
          color={"#2d5016"} 
          metalness={0.02} 
          roughness={0.7}
          normalScale={[0.1, 0.1]}
        />
      </mesh>
      
      {/* PCB surface texture grid pattern */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`grid-h-${i}`} position={[-width/2 + i * (width/19), thickness/2 + 0.001, 0]}>
          <boxGeometry args={[0.01, 0.001, depth]} />
          <meshStandardMaterial color={"#1a3d0a"} transparent opacity={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={`grid-v-${i}`} position={[0, thickness/2 + 0.001, -depth/2 + i * (depth/15)]}>
          <boxGeometry args={[width, 0.001, 0.01]} />
          <meshStandardMaterial color={"#1a3d0a"} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* CPU: big metallic lid with square socket below
   We'll display "ACM" text on the lid
*/
function CPU({ pos = [3.6, 0.35, 0.8], size = [2.2, 0.5, 2.2] }: { pos?: [number, number, number], size?: [number, number, number] }) {
  return (
    <group position={pos}>
      {/* socket base (slightly recessed) */}
      <mesh position={[0, -0.06, 0]} castShadow>
        <boxGeometry args={[size[0] + 0.12, 0.08, size[2] + 0.12]} />
        <meshStandardMaterial color={"#f5f5dc"} metalness={0.1} roughness={0.6} />
      </mesh>

      {/* metallic heatspreader / CPU lid */}
      <mesh position={[0, size[1] / 2, 0]} castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={"#e8e8e8"} metalness={0.9} roughness={0.15} />
      </mesh>

      {/* AMD label on top */}
      <Text
        position={[0, size[1] + 0.02, 0]}
        fontSize={0.35}
        color="#333"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
      >
        AMD
      </Text>
    </group>
  );
}

/* RAM slots — beige/yellow long slots like in the reference image */
function RAMSlot({ pos = [5.4, 0.08, -0.3], length = 4.8 } : { pos: [number, number, number], length?: number}) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[length, 0.12, 0.32]} />
        <meshStandardMaterial color={"#D4B341"} metalness={0.3} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[length * 0.96, 0.02, 0.22]} />
        <meshStandardMaterial color={"#B8A532"} metalness={0.55} roughness={0.18} />
      </mesh>
    </group>
  );
}

/* PCI slot — beige long slots on left */
function PCISlot({ pos = [-4.8, 0.08, -1.4], length = 5.4, color = "#e6d6b2" } : { pos: [number, number, number], length?: number, color?: string}) {
  return (
    <group position={pos}>
      <mesh castShadow>
        <boxGeometry args={[length, 0.12, 0.36]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[length * 0.98, 0.02, 0.26]} />
        <meshStandardMaterial color={"#cdbf9d"} metalness={0.45} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* Blue PCI-E slots like in reference image */
function PCIESlot({ pos = [0, 0.08, 4.2], length = 9.6 } : { pos: [number, number, number], length?: number}) {
  return (
    <group position={pos}>
      <mesh castShadow>
        <boxGeometry args={[length, 0.12, 0.36]} />
        <meshStandardMaterial color={"#1E3A8A"} metalness={0.3} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[length * 0.98, 0.02, 0.26]} />
        <meshStandardMaterial color={"#1E40AF"} metalness={0.55} roughness={0.18} />
      </mesh>
      {/* PCI-E connector pins */}
      {Array.from({ length: Math.floor(length / 0.1) }).map((_, i) => (
        <mesh key={i} position={[-length/2 + i * 0.1, 0.08, 0]}>
          <boxGeometry args={[0.05, 0.04, 0.2]} />
          <meshStandardMaterial color={"#FFD700"} metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/* Orange heatsink (vertical fins) - matches reference image */
function Heatsink({ pos = [1.6, 0.3, -0.5], w = 2.2, h = 0.6, d = 1.8, fins = 9 }: { pos?: [number, number, number], w?: number, h?: number, d?: number, fins?: number }) {
  const xs = useMemo(() => {
    const arr = [];
    for (let i = 0; i < fins; i++) {
      arr.push(-w / 2 + (i + 0.5) * (w / fins));
    }
    return arr;
  }, [w, fins]);

  return (
    <group position={pos as [number, number, number]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[w, 0.08, d]} />
        <meshStandardMaterial color={"#CC5500"} metalness={0.35} roughness={0.28} />
      </mesh>
      {xs.map((x, i) => (
        <mesh key={i} position={[x, h / 2 - 0.02, 0]} castShadow>
          <boxGeometry args={[w / fins * 0.85, h, d * 0.95]} />
          <meshStandardMaterial color={"#FF6600"} metalness={0.4} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/* Chipset grid: array of tiny cubes */
// function ChipsetGrid({ pos = [0.6, 0.12, 0.6], cols = 8, rows = 8, pitch = 0.18 }: { pos?: [number, number, number], cols?: number, rows?: number, pitch?: number }) {
//   const cubes = useMemo(() => {
//     const out: [number, number, number][] = [];
//     const w = (cols - 1) * pitch;
//     const h = (rows - 1) * pitch;
//     for (let r = 0; r < rows; r++) {
//       for (let c = 0; c < cols; c++) {
//         out.push([c * pitch - w / 2, 0.08, r * pitch - h / 2]);
//       }
//     }
//     return out;
//   }, [cols, rows, pitch]);

//   return (
//     <group position={pos as [number, number, number]} >
//       {cubes.map((p, i) => (
//         <mesh key={i} position={p as [number, number, number]} castShadow>
//           <boxGeometry args={[0.14, 0.14, 0.14]} />
//           <meshStandardMaterial color={"#181818"} metalness={0.6} roughness={0.25} />
//         </mesh>
//       ))}
//     </group>
//   );
// }

/* Capacitor with blue top */
function CapBlue({ pos = [0, 0.22, 0], h = 0.36, r = 0.14 }: { pos?: [number, number, number], h?: number, r?: number }) {
  return (
    <group position={pos as [number, number, number]}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, h, 24]} />
        <meshStandardMaterial color={"#183a6b"} metalness={0.45} roughness={0.22} />
      </mesh>
      <mesh position={[0, h / 2 + 0.01, 0]} castShadow>
        <cylinderGeometry args={[r * 0.9, r * 0.9, 0.02, 20]} />
        <meshStandardMaterial color={"#69a3ff"} metalness={0.7} roughness={0.15} />
      </mesh>
    </group>
  );
}

/* Surface Mount Device (SMD) components */
function SMDComponent({ pos = [0, 0.05, 0], size = [0.2, 0.05, 0.1], color = "#333" }: { pos?: [number, number, number], size?: [number, number, number], color?: string }) {
  return (
    <mesh position={pos as [number, number, number]} castShadow>
      <boxGeometry args={size as [number, number, number]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

/* Integrated Circuit (IC) chip */
function ICChip({ pos = [0, 0.08, 0], size = [0.8, 0.12, 0.8], pins = 16 }: { pos?: [number, number, number], size?: [number, number, number], pins?: number }) {
  return (
    <group position={pos as [number, number, number]}>
      {/* Main chip body */}
      <mesh castShadow>
        <boxGeometry args={size as [number, number, number]} />
        <meshStandardMaterial color={"#1a1a1a"} metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* IC pins */}
      {Array.from({ length: pins }).map((_, i) => {
        const side = Math.floor(i / (pins / 4));
        const pinOnSide = i % (pins / 4);
        let x = 0, z = 0;
        
        switch(side) {
          case 0: x = -size[0]/2 - 0.05; z = -size[2]/2 + (pinOnSide * size[2]/(pins/4 - 1)); break;
          case 1: z = size[2]/2 + 0.05; x = -size[0]/2 + (pinOnSide * size[0]/(pins/4 - 1)); break;
          case 2: x = size[0]/2 + 0.05; z = size[2]/2 - (pinOnSide * size[2]/(pins/4 - 1)); break;
          case 3: z = -size[2]/2 - 0.05; x = size[0]/2 - (pinOnSide * size[0]/(pins/4 - 1)); break;
        }
        
        return (
          <mesh key={i} position={[x, -size[1]/2, z]} castShadow>
            <boxGeometry args={[0.05, 0.02, 0.02]} />
            <meshStandardMaterial color={"#C0C0C0"} metalness={0.9} roughness={0.1} />
          </mesh>
        );
      })}
      
      {/* IC label dot */}
      <mesh position={[-size[0]/3, size[1]/2 + 0.001, -size[2]/3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.001, 16]} />
        <meshStandardMaterial color={"#ffffff"} />
      </mesh>
    </group>
  );
}

/* Coin battery */
function Battery({ pos = [-3.6, 0.12, 3.6], radius = 0.5 }: { pos?: [number, number, number], radius?: number }) {
  return (
    <group position={pos as [number, number, number]}>
      <mesh rotation={[0, 0, Math.PI / 8]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.14, 40]} />
        <meshStandardMaterial color={"#cfcfcf"} metalness={0.9} roughness={0.12} />
      </mesh>
      <Text position={[0, 0.12, 0]} fontSize={0.28} color={"#111"} anchorX="center" anchorY="middle" rotation={[-Math.PI/2, 0, 0]}>+</Text>
    </group>
  );
}

/* Small surface resistor (dark grey rectangle) */
function SmallRes({ pos = [0, 0.12, 0], size = [0.36, 0.12, 0.16] }: { pos?: [number, number, number], size?: [number, number, number] }) {
  return (
    <mesh position={pos as [number, number, number]} castShadow>
      <boxGeometry args={size as [number, number, number]} />
      <meshStandardMaterial color={"#555"} metalness={0.15} roughness={0.55} />
    </mesh>
  );
}

/* Copper traces: thin raised paths (straight simple bands + some arcs approximation) */
function CopperTraces({ positions }: { positions: [number, number, number, number][] }) {
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]}>
          <boxGeometry args={[p[3], 0.02, 0.04]} />
          <meshStandardMaterial color={"#2a8c1a"} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* Generic slot component for various connectors */
// function Slot({ pos = [0, 0.06, 0], size = [9.6, 0.09, 0.36] } : { pos: [number, number, number], size?: [number, number, number]}) {
//   return (
//     <group position={pos}>
//       <mesh castShadow>
//         <boxGeometry args={size} />
//         <meshStandardMaterial color={"#8b6e48"} metalness={0.3} roughness={0.35} />
//       </mesh>
//       <mesh position={[0, size[1] / 2, 0]} castShadow>
//         <boxGeometry args={[size[0] * 0.95, size[1] * 0.3, size[2] * 0.8]} />
//         <meshStandardMaterial color={"#654422"} metalness={0.45} roughness={0.2} />
//       </mesh>
//     </group>
//   );
// }

/* Power connector header component */
function PowerHeader({ pos = [0, 0.2, 0], size = [1.6, 0.36, 0.4] } : { pos: [number, number, number], size?: [number, number, number]}) {
  return (
    <group position={pos}>
      <mesh castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={"#2a2a2a"} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, size[1] / 4, 0]} castShadow>
        <boxGeometry args={[size[0] * 0.9, size[1] * 0.6, size[2] * 0.9]} />
        <meshStandardMaterial color={"#ffcc00"} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

/* Clickable Component Wrapper */
function ClickableComponent({ 
  children, 
  domain, 
  position, 
  onDomainClick 
}: { 
  children: React.ReactNode, 
  domain: string, 
  position: [number, number, number],
  onDomainClick: (domain: string, position: [number, number, number]) => void 
}) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onDomainClick(domain, position);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      {children}
      {hovered && (
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

/* Enhanced PCB Circuit Traces - much more detailed like reference image */
function PCBCircuitTraces() {
  const circuitTraces = useMemo(() => {
    const traces = [];
    
    // Power traces (thick, golden copper) - 24-pin to CPU with multiple paths
    for (let i = 0; i < 8; i++) {
      traces.push({
        start: [4.9 - i * 0.1, 0.03, -4.2 + i * 0.05],
        end: [3.6 - i * 0.05, 0.03, 0.2 + i * 0.1],
        width: 0.06 + i * 0.005,
        color: "#B8860B"
      });
    }
    
    // Dense parallel traces like in reference - data buses
    for (let i = 0; i < 16; i++) {
      traces.push({
        start: [3.6, 0.025, 2.2 + i * 0.05],
        end: [-1.5, 0.025, 3.2 + i * 0.05],
        width: 0.02,
        color: "#D4AF37"
      });
    }
    
    // Address bus traces
    for (let i = 0; i < 12; i++) {
      traces.push({
        start: [3.0 + i * 0.05, 0.025, 1.8],
        end: [-1.0 + i * 0.05, 0.025, 3.8],
        width: 0.018,
        color: "#CD7F32"
      });
    }
    
    // Complex routing around chipset - radiating pattern
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      const radius1 = 0.8;
      const radius2 = 2.5;
      traces.push({
        start: [-0.2 + Math.cos(angle) * radius1, 0.02, 0.8 + Math.sin(angle) * radius1],
        end: [-0.2 + Math.cos(angle) * radius2, 0.02, 0.8 + Math.sin(angle) * radius2],
        width: 0.015,
        color: "#DAA520"
      });
    }
    
    // PCI-E lanes (differential pairs)
    for (let slot = 0; slot < 4; slot++) {
      for (let lane = 0; lane < 16; lane++) {
        traces.push({
          start: [-0.8, 0.025, 0.8 - slot * 0.1],
          end: [-4.5, 0.025, -1.0 + slot * 1.4],
          width: 0.012,
          color: lane % 2 === 0 ? "#32CD32" : "#228B22"
        });
      }
    }
    
    // High-frequency clock traces (shorter, wider)
    for (let i = 0; i < 6; i++) {
      traces.push({
        start: [-0.2 + i * 0.1, 0.025, 0.5],
        end: [3.6 + i * 0.05, 0.025, 1.0],
        width: 0.025,
        color: "#FF6347"
      });
    }
    
    // Ground grid pattern - more comprehensive
    for (let i = -6; i <= 6; i += 0.5) {
      traces.push({
        start: [i, 0.01, -6],
        end: [i, 0.01, 6],
        width: i % 2 === 0 ? 0.03 : 0.015,
        color: "#2F4F4F"
      });
      traces.push({
        start: [-6, 0.01, i],
        end: [6, 0.01, i],
        width: i % 2 === 0 ? 0.03 : 0.015,
        color: "#2F4F4F"
      });
    }
    
    // Via stitching pattern
    for (let x = -5; x <= 5; x += 0.4) {
      for (let z = -5; z <= 5; z += 0.4) {
        if (Math.random() > 0.3) { // Random via placement
          traces.push({
            start: [x, 0.015, z],
            end: [x, 0.015, z],
            width: 0.06,
            color: "#C0C0C0"
          });
        }
      }
    }
    
    // Curved traces around components (approximated with short segments)
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      const x1 = 2.0 + Math.sin(t * Math.PI) * 1.5;
      const z1 = 0.5 + t * 2.0;
      const x2 = 2.0 + Math.sin((t + 0.05) * Math.PI) * 1.5;
      const z2 = 0.5 + (t + 0.05) * 2.0;
      
      traces.push({
        start: [x1, 0.02, z1],
        end: [x2, 0.02, z2],
        width: 0.02,
        color: "#DAA520"
      });
    }
    
    // Additional detailed traces like in reference image
    
    // Dense memory controller traces (DDR interface)
    for (let i = 0; i < 32; i++) {
      const offset = (i % 2) * 0.05;
      traces.push({
        start: [3.2 + offset, 0.02, 2.0 + i * 0.025],
        end: [-1.8 + offset, 0.02, 3.0 + i * 0.025],
        width: 0.012,
        color: "#FFD700"
      });
    }
    
    // High-speed differential pairs around CPU
    for (let i = 0; i < 20; i++) {
      const angle = (i * Math.PI * 2) / 20;
      const radius = 1.2;
      traces.push({
        start: [3.6 + Math.cos(angle) * 0.8, 0.02, 1.0 + Math.sin(angle) * 0.8],
        end: [3.6 + Math.cos(angle) * radius, 0.02, 1.0 + Math.sin(angle) * radius],
        width: 0.01,
        color: "#32CD32"
      });
      // Differential pair
      traces.push({
        start: [3.6 + Math.cos(angle) * 0.8, 0.02, 1.0 + Math.sin(angle) * 0.8 + 0.02],
        end: [3.6 + Math.cos(angle) * radius, 0.02, 1.0 + Math.sin(angle) * radius + 0.02],
        width: 0.01,
        color: "#32CD32"
      });
    }
    
    // Dense I/O routing patterns
    for (let i = 0; i < 24; i++) {
      traces.push({
        start: [1.0 + i * 0.15, 0.015, -4.0],
        end: [-0.5 + i * 0.08, 0.015, 0.2],
        width: 0.008,
        color: "#9370DB"
      });
    }
    
    // Power plane stitching (connecting different power zones)
    for (let i = 0; i < 16; i++) {
      const x = -5 + i * 0.7;
      traces.push({
        start: [x, 0.03, -4],
        end: [x, 0.03, 4],
        width: 0.08,
        color: "#B8860B"
      });
    }
    
    // Clock distribution tree
    const clockCenter = [-0.2, 0.02, 0.8];
    for (let level = 1; level <= 3; level++) {
      const numTraces = Math.pow(2, level);
      for (let i = 0; i < numTraces; i++) {
        const angle = (i * Math.PI * 2) / numTraces;
        const radius = level * 0.8;
        traces.push({
          start: clockCenter,
          end: [clockCenter[0] + Math.cos(angle) * radius, clockCenter[1], clockCenter[2] + Math.sin(angle) * radius],
          width: 0.015 / level,
          color: "#FF1493"
        });
      }
    }
    
    // Serpentine delay lines (length matching)
    for (let i = 0; i < 8; i++) {
      const baseX = 0.5 + i * 0.3;
      const baseZ = 2.0;
      for (let seg = 0; seg < 6; seg++) {
        const direction = seg % 2 === 0 ? 1 : -1;
        traces.push({
          start: [baseX + seg * 0.05, 0.02, baseZ + direction * 0.1],
          end: [baseX + (seg + 1) * 0.05, 0.02, baseZ + direction * 0.1],
          width: 0.01,
          color: "#00CED1"
        });
        if (seg < 5) {
          traces.push({
            start: [baseX + (seg + 1) * 0.05, 0.02, baseZ + direction * 0.1],
            end: [baseX + (seg + 1) * 0.05, 0.02, baseZ - direction * 0.1],
            width: 0.01,
            color: "#00CED1"
          });
        }
      }
    }

    return traces;
  }, []);

  return (
    <group>
      {circuitTraces.map((trace, i) => {
        const length = Math.sqrt(
          Math.pow(trace.end[0] - trace.start[0], 2) + 
          Math.pow(trace.end[2] - trace.start[2], 2)
        );
        
        if (length < 0.01) {
          // This is a via
          return (
            <mesh key={i} position={[trace.start[0], trace.start[1], trace.start[2]]}>
              <cylinderGeometry args={[trace.width/2, trace.width/2, 0.01, 12]} />
              <meshStandardMaterial 
                color={trace.color} 
                metalness={0.9} 
                roughness={0.1}
              />
            </mesh>
          );
        }
        
        const midX = (trace.start[0] + trace.end[0]) / 2;
        const midZ = (trace.start[2] + trace.end[2]) / 2;
        const angle = Math.atan2(trace.end[2] - trace.start[2], trace.end[0] - trace.start[0]);
        
        return (
          <mesh key={i} position={[midX, trace.start[1], midZ]} rotation={[0, angle, 0]}>
            <boxGeometry args={[length, 0.002, trace.width]} />
            <meshStandardMaterial 
              color={trace.color} 
              metalness={0.9} 
              roughness={0.1}
              emissive={trace.color}
              emissiveIntensity={0.01}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ---------- Full Layout (arranged to match image) ---------- */

function MotherboardLayoutAccurate({ onDomainClick }: { onDomainClick: (domain: string, position: [number, number, number]) => void }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Responsive font sizes
  const getFontSize = (baseSize: number) => isMobile ? baseSize * 1.2 : baseSize;
  const capPositions = [
    [2.6, 0.22, -0.9],
    [3.1, 0.22, -0.4],
    [3.8, 0.22, 0.6],
    [3.3, 0.22, 1.4],
    [1.0, 0.22, -2.6],
  ] as [number, number, number][];

  // copper trace positions (we'll feed x,z and length via extra tuple element)
  const traces = [
    [-4.0, 0.05, -5.1, 3.2],
    [-1.2, 0.05, -3.4, 2.2],
    [1.6, 0.05, -1.0, 4.2],
    [3.6, 0.05, 1.6, 2.0],
  ] as [number, number, number, number][];

  return (
    <group>
      {/* PCB */}
      <PCB width={14} depth={12} />

      {/* Left PCI slots stack (design domain) - repositioned within bounds */}
      <ClickableComponent 
        domain="design" 
        position={[-4.5, 0, -1.0]} 
        onDomainClick={onDomainClick}
      >
        <group>
          <PCISlot pos={[0, 0.08, -1.8]} length={4.0} />
          <PCISlot pos={[0, 0.08, -0.6]} length={4.0} />
          <PCISlot pos={[0, 0.08, 0.6]} length={4.0} />
          <PCISlot pos={[0, 0.08, 1.8]} length={4.0} />
          <Text position={[0, 0.3, 0]} fontSize={getFontSize(0.4)} color={"#ffffff"} rotation={[-Math.PI / 2, 0, 0]}>design</Text>
        </group>
      </ClickableComponent>

      {/* PCI edge long connector (thin brown vertical connector near center-left) */}
      <mesh position={[-2.0, 0.12, 1.2]} castShadow>
        <boxGeometry args={[1.1, 0.14, 0.26]} />
        <meshStandardMaterial color={"#8b6e48"} metalness={0.3} roughness={0.35} />
      </mesh>

      {/* Heatsink (tech domain) */}
      <ClickableComponent 
        domain="tech" 
        position={[1.6, 0.28, -0.6]} 
        onDomainClick={onDomainClick}
      >
        <Heatsink pos={[0, 0, 0]} w={2.2} h={0.5} d={1.4} fins={9} />
      </ClickableComponent>

      {/* Chipset grid near center - make it more like an actual chipset */}
      <ICChip pos={[-0.2, 0.14, 0.8]} size={[1.2, 0.15, 1.2]} pins={144} />
      
      {/* Additional support chips around the board */}
      <ICChip pos={[1.5, 0.08, -2.0]} size={[0.6, 0.08, 0.6]} pins={32} />
      <ICChip pos={[-2.5, 0.08, 2.0]} size={[0.8, 0.08, 0.8]} pins={48} />
      <ICChip pos={[5.0, 0.08, -1.0]} size={[0.4, 0.06, 0.4]} pins={16} />

      {/* CPU (management domain) */}
      <ClickableComponent 
        domain="management" 
        position={[3.6, 0.35, 1.0]} 
        onDomainClick={onDomainClick}
      >
        <CPU pos={[0, 0, 0]} size={[2.2, 0.5, 2.2]} />
      </ClickableComponent>
      
      {/* CPU socket mounting holes */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i * Math.PI) / 2;
        const radius = 1.4;
        const x = 3.6 + Math.cos(angle) * radius;
        const z = 1.0 + Math.sin(angle) * radius;
        return (
          <mesh key={`socket-hole-${i}`} position={[x, 0.04, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshStandardMaterial color={"#2d5016"} />
          </mesh>
        );
      })}

      {/* RAM slots: 4 beige/tan DIMM slots like in reference image - repositioned higher */}
      <ClickableComponent domain="competitive coding" position={[-1.5, 0.06, 0.5]} onDomainClick={onDomainClick}>
        <group position={[-1.5, 0.06, 0.5]}>
          {[0, 1, 2, 3].map((i) => (
            <RAMSlot key={i} pos={[0, 0.06, i * 0.4 - 0.6]} length={3.5} />
          ))}
          <Text position={[0, 0.6, -1.0]} fontSize={getFontSize(0.35)} color={"#ffffff"} rotation={[-Math.PI / 2, 0, 0]}>competitive coding</Text>
        </group>
      </ClickableComponent>

      {/* PCIe slots (research domain) - repositioned higher on the board */}
      <ClickableComponent domain="research" position={[0, 0.06, 2.0]} onDomainClick={onDomainClick}>
        <group>
          <PCIESlot pos={[0, 0.06, 2.0]} length={7.0} />
          <PCIESlot pos={[0, 0.06, 2.8]} length={5.0} />
          {/* Additional shorter PCI-E slot */}
          <PCIESlot pos={[2.5, 0.06, 1.5]} length={3.5} />
          <Text position={[1.5, 0.3, 2.0]} fontSize={getFontSize(0.4)} color={"#ffffff"} rotation={[-Math.PI / 2, 0, 0]}>research</Text>
        </group>
      </ClickableComponent>

      {/* I/O block top-middle - repositioned to stay within PCB bounds */}
      <group position={[1.8, 0.18, -5.0]}>
        {/* USB connectors */}
        <mesh position={[0.6, 0, 0]} castShadow>
          <boxGeometry args={[1.4, 0.36, 0.6]} />
          <meshStandardMaterial color={"#ff87c7"} metalness={0.7} roughness={0.18} />
        </mesh>
        
        {/* Ethernet port */}
        <mesh position={[-0.8, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.36, 0.5]} />
          <meshStandardMaterial color={"#00ff00"} metalness={0.7} roughness={0.18} />
        </mesh>
        
        {/* Audio jacks */}
        <mesh position={[-1.6, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 0.36, 0.5]} />
          <meshStandardMaterial color={"#cbd5e1"} metalness={0.9} roughness={0.2} />
        </mesh>
        
        {/* Individual audio ports */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-1.6 + i * 0.12, 0.1, 0.15]}>
            <cylinderGeometry args={[0.04, 0.04, 0.15, 16]} />
            <meshStandardMaterial color={["#90EE90", "#FF69B4", "#87CEEB", "#DDA0DD", "#F0E68C", "#FFB6C1"][i]} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 24-pin power connector (top-right) - repositioned within bounds */}
      <PowerHeader pos={[4.5, 0.2, -5.2]} size={[1.6, 0.36, 0.4]} />
      <Text position={[4.5, 0.6, -5.2]} fontSize={0.22} color={"#fff"} rotation={[-Math.PI / 2, 0, 0]}>24-pin</Text>

      {/* 8-pin power (top-left) - repositioned within bounds */}
      <PowerHeader pos={[-4.0, 0.2, -5.0]} size={[0.4, 0.36, 1.6]} />
      <Text position={[-4.0, 0.6, -5.0]} fontSize={0.22} color={"#fff"} rotation={[-Math.PI / 2, 0, 0]}>8-pin</Text>

      {/* Battery bottom-left - repositioned within bounds */}
      <Battery pos={[-3.5, 0.12, 4.5]} />

      {/* Capacitors group near cpu/heatsink - more realistic placement */}
      {capPositions.map((p, i) => (
        <CapBlue key={i} pos={p} />
      ))}
      
      {/* Additional capacitors around CPU area like in reference - constrained to PCB */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        const radius = 1.5; // Reduced radius to stay within bounds
        const x = Math.max(-6.5, Math.min(6.5, 3.6 + Math.cos(angle) * radius));
        const z = Math.max(-5.5, Math.min(5.5, 1.0 + Math.sin(angle) * radius));
        return <CapBlue key={`cpu-cap-${i}`} pos={[x, 0.22, z]} h={0.3} r={0.1} />;
      })}

      {/* More capacitors near RAM area - repositioned */}
      {Array.from({ length: 8 }).map((_, i) => (
        <CapBlue key={`ram-cap-${i}`} pos={[-1.5 + i * 0.3, 0.22, 2.2]} h={0.25} r={0.08} />
      ))}

      {/* small resistors scattered to add detail - repositioned to stay within bounds */}
      {Array.from({ length: 24 }).map((_, i) => {
        const x = -4.5 + (i % 6) * 1.5; // Adjusted to stay within -6.5 to 6.5
        const z = -3.5 + Math.floor(i / 6) * 1.8; // Adjusted to stay within -5.5 to 5.5
        return <SmallRes key={i} pos={[x, 0.12, z]} size={[0.25, 0.08, 0.12]} />;
      })}
      
      {/* Dense SMD component areas like in reference image - repositioned */}
      {Array.from({ length: 50 }).map((_, i) => {
        const x = -3.5 + (i % 10) * 0.3; // Adjusted to stay within bounds
        const z = -2.5 + Math.floor(i / 10) * 0.3; // Adjusted to stay within bounds
        const componentType = i % 4;
        const colors = ["#333", "#8B4513", "#2F4F4F", "#556B2F"];
        const sizes = [
          [0.1, 0.03, 0.05], // resistor
          [0.08, 0.04, 0.08], // cap
          [0.15, 0.02, 0.1], // inductor
          [0.12, 0.03, 0.06] // diode
        ];
        return <SMDComponent key={`smd-${i}`} pos={[x, 0.04, z]} size={sizes[componentType] as [number, number, number]} color={colors[componentType]} />;
      })}
      
      {/* More SMD components around CPU area - constrained */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 30;
        const radius = 1.8 + (i % 3) * 0.2; // Reduced radius
        const x = Math.max(-6.5, Math.min(6.5, 3.6 + Math.cos(angle) * radius));
        const z = Math.max(-5.5, Math.min(5.5, 1.0 + Math.sin(angle) * radius));
        return <SMDComponent key={`cpu-smd-${i}`} pos={[x, 0.04, z]} size={[0.08, 0.02, 0.04]} color="#2F4F4F" />;
      })}

      {/* many small blue capacitors near bottom slots - repositioned */}
      {Array.from({ length: 10 }).map((_, i) => (
        <CapBlue key={`bottomcap-${i}`} pos={[-3.0 + i * 0.6, 0.22, 4.8]} h={0.2} r={0.06} />
      ))}

      {/* glow-ish copper traces approximated */}
      <CopperTraces positions={traces} />

      {/* Enhanced PCB Circuit Traces */}
      <PCBCircuitTraces />

      {/* Interactive Domain Labels */}
      <Text 
        position={[3.6, 0.9, 1.0]} 
        fontSize={0.35} 
        color={"#ffffff"} 
        anchorX="center" 
        anchorY="middle" 
        rotation={[-Math.PI/2, 0, 0]}
      >
        management
      </Text>
      
      <Text 
        position={[1.6, 0.9, -0.6]} 
        fontSize={0.3} 
        color={"#ffffff"} 
        anchorX="center" 
        anchorY="middle" 
        rotation={[-Math.PI/2, 0, 0]}
      >
        tech
      </Text>
      
      <Text position={[4.9, 0.9, -4.2]} fontSize={0.15} color={"#ffffff"} anchorX="center" anchorY="middle" rotation={[-Math.PI/2, 0, 0]}>ATX_PWR</Text>
      <Text position={[-4.5, 0.9, -4.5]} fontSize={0.15} color={"#ffffff"} anchorX="center" anchorY="middle" rotation={[-Math.PI/2, 0, 0]}>CPU_PWR</Text>
      
      {/* Component reference designators like C1, R1, etc. - repositioned */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Text 
          key={`ref-${i}`}
          position={[1.5 + i * 0.6, 0.05, 0.5]} 
          fontSize={0.08} 
          color={"#cccccc"} 
          anchorX="center" 
          rotation={[-Math.PI/2, 0, 0]}
        >
          C{i + 1}
        </Text>
      ))}
    </group>
  );
}

/* ---------- Rotatable Motherboard Wrapper ---------- */
function RotatableMotherboard() {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<[number, number, number] | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const { size, camera } = useThree();
  const navigate = useNavigate();
  const maxRotation = THREE.MathUtils.degToRad(20); // 20 degrees max rotation

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle domain clicks with balanced zoom animation
  const handleDomainClick = (domain: string, position: [number, number, number]) => {
    console.log(`Clicked on ${domain} at position:`, position);
    
    // Start zoom animation
    setIsZooming(true);
    setZoomTarget(position);
    
    // Mobile-responsive rotation
    const rotationMultiplier = isMobile ? 0.6 : 1.0; // Less dramatic on mobile
    setTargetRotation(prev => ({
      x: prev.x + THREE.MathUtils.degToRad(8 * rotationMultiplier), 
      y: prev.y + THREE.MathUtils.degToRad(3 * rotationMultiplier)  
    }));
    
    // Faster navigation on mobile for better UX
    const duration = isMobile ? 2000 : 2500;
    setTimeout(() => {
      // Navigate to domain page after zoom completes
      let route = `/${domain.replace(' ', '-')}`;
      navigate(route);
    }, duration);
  };
  
  // Animation loop for rotation and zoom
  useFrame(() => {
    if (!isDragging && groupRef.current) {
      // Spring animation back to initial position
      const springStrength = 0.1;
      const damping = 0.9;
      
      setTargetRotation(prev => ({
        x: prev.x * damping,
        y: prev.y * damping
      }));
      
      setRotation(prev => ({
        x: prev.x + (targetRotation.x - prev.x) * springStrength,
        y: prev.y + (targetRotation.y - prev.y) * springStrength
      }));
      
      // Apply rotation (keeping the original 90-degree X rotation for face orientation)
      groupRef.current.rotation.set(
        Math.PI / 2 + rotation.x,
        rotation.y,
        0
      );
    }
    
    // Handle balanced zoom animation - responsive for mobile
    if (isZooming && zoomTarget && camera) {
      const mobileOffset = isMobile ? 1 : 0; // Slightly further back on mobile
      const targetPosition = new THREE.Vector3(
        zoomTarget[0], 
        zoomTarget[1] + 3 + mobileOffset, // Good viewing distance above component
        zoomTarget[2] + 2 + mobileOffset  // Reasonable distance from component
      );
      
      // Smooth camera movement towards target
      camera.position.lerp(targetPosition, 0.06);
      camera.lookAt(zoomTarget[0], zoomTarget[1], zoomTarget[2]);
      camera.updateMatrixWorld();
    }
  });
  
  // Add window event listeners for better mouse handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const currentMouse = {
        x: (e.clientX / size.width) * 2 - 1,
        y: -(e.clientY / size.height) * 2 + 1
      };
      
      const deltaX = currentMouse.x - dragStart.x;
      const deltaY = currentMouse.y - dragStart.y;
      
      // Convert mouse movement to rotation, with limits
      const newRotationY = THREE.MathUtils.clamp(deltaX * 2, -maxRotation, maxRotation);
      const newRotationX = THREE.MathUtils.clamp(deltaY * 2, -maxRotation, maxRotation);
      
      setTargetRotation({ x: newRotationX, y: newRotationY });
      setRotation({ x: newRotationX, y: newRotationY });
      
      if (groupRef.current) {
        groupRef.current.rotation.set(
          Math.PI / 2 + newRotationX,
          newRotationY,
          0
        );
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setTargetRotation({ x: 0, y: 0 });
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, size, maxRotation]);
  
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    
    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    
    setDragStart({
      x: (clientX / size.width) * 2 - 1,
      y: -(clientY / size.height) * 2 + 1
    });
  };
  
  return (
    <group
      ref={groupRef}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
    >
      <MotherboardLayoutAccurate onDomainClick={handleDomainClick} />
    </group>
  );
}

/* ---------- Wrapper scene ---------- */
export default function Motherboard3D() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ 
      width: "100%", 
      height: "100vh", 
      background: "#0b2430", 
      overflow: "hidden",
      touchAction: "manipulation" // Better touch handling
    }}>
      <Canvas 
        shadows={!isMobile} // Disable shadows on mobile for performance
        dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower DPR for mobile performance
        gl={{ 
          antialias: !isMobile, // Disable antialiasing on mobile for performance
          powerPreference: "high-performance",
          alpha: false, // Better performance
          stencil: false // Better performance
        }}
        frameloop="demand" // Only render when needed for better mobile battery life
      >
        <color attach="background" args={["#002430"]} />

        {/* Lighting: front + fill + subtle rim */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 6, 8]} intensity={1.1} castShadow />
        <pointLight position={[0, 3, 6]} intensity={0.55} />
        <spotLight position={[6, 8, -6]} angle={0.6} intensity={0.25} />

        <Suspense fallback={<Loader />}>
          {/* Rotatable motherboard component */}
          <RotatableMotherboard />
        </Suspense>

        {/* Responsive camera positioning */}
        <PerspectiveCamera 
          makeDefault 
          position={isMobile ? [0, 0, 25] : [0, 0, 20]} 
          fov={isMobile ? 60 : 45} 
        />
      </Canvas>
    </div>
  );
}

// export default function Motherboard3D() {
//   return (
//     <div style={{ width: "100%", height: "100vh", background: "#0b2430" }}>
//       <Canvas shadows>
//         <ambientLight intensity={0.5} />
//         <directionalLight position={[5, 5, 5]} intensity={1} />

//         <group rotation={[Math.PI/2, 0, 0]}>
//           <PCB />
//           <CPU />
//         </group>

//         <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={45} />
//       </Canvas>
//     </div>
//   );
// }