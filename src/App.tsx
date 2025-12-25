import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SEO } from './components/SEO';

// Placeholder for About
const About = () => (
  <div style={{ padding: '4rem', textAlign: 'center' }}>
    <SEO title="Nosotros" description="Sobre InformacionQueCura" />
    <h1>Nosotros</h1>
    <p>Comprometidos con la excelencia en datos.</p>
  </div>
);

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Services = lazy(() => import('./pages/Services').then(module => ({ default: module.Services })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main>
          <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
