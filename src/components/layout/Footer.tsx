import { Link } from 'react-router-dom';
import { Database, Mail, Phone, MapPin } from 'lucide-react';
import '../../styles/layout.css';

export function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-section">
                    <div className="logo" style={{ marginBottom: '1rem' }}>
                        <Database size={24} />
                        Informacion<span>QueCura</span>
                    </div>
                    <p>Expertos en limpieza, estandarización y enriquecimiento de datos para empresas.</p>
                </div>

                <div className="footer-section">
                    <h3>Enlaces Rápidos</h3>
                    <Link to="/">Inicio</Link>
                    <Link to="/services">Servicios</Link>
                    <Link to="/about">Nosotros</Link>
                    <Link to="/contact">Contacto</Link>
                </div>

                <div className="footer-section">
                    <h3>Contacto</h3>
                    <p><Mail size={16} style={{ display: 'inline', marginRight: '8px' }} /> hola@informacionquecura.com</p>
                    <p><Phone size={16} style={{ display: 'inline', marginRight: '8px' }} /> +52 55 1234 5678</p>
                    <p><MapPin size={16} style={{ display: 'inline', marginRight: '8px' }} /> Ciudad de México, México</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} InformacionQueCura. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}
