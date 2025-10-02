import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Motherboard3D from '../components/motherboard';
import ManagementPage from './pages/management';
import ResearchPage from './pages/research';
import TechPage from './pages/tech';
import DesignPage from './pages/design';
import CompetitiveCodingPage from './pages/competitiveCoding';

export default function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div style={{ height: '100vh', width: '100vw', background: '#061018' }}>
            <Motherboard3D />
          </div>
        } />
        <Route path="/management" element={<ManagementPage />} />
        <Route path="/competitive-coding" element={<CompetitiveCodingPage />} />
        <Route path="/tech" element={<TechPage />} />
        <Route path="/design" element={<DesignPage />} />
        <Route path="/research" element={<ResearchPage />} />
      </Routes>
    </Router>
  );
}