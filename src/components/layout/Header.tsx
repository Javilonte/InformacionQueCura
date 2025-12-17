import { Link, useLocation } from 'react-router-dom';
import { Database, Menu, X } from 'lucide-react';
import { useState } from 'react';
import '../../styles/layout.css';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <header className="site-header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <Database size={28} />
                    Informacion<span>QueCura</span>
                </Link>

                <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
                    <ul>
                        <li><Link to="/" className={isActive('/')}>Inicio</Link></li>
                        <li><Link to="/services" className={isActive('/services')}>Servicios</Link></li>
                        <li><Link to="/about" className={isActive('/about')}>Nosotros</Link></li>
                        <li><Link to="/contact" className={isActive('/contact')}>Contacto</Link></li>
                    </ul>
                </nav>

                <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </header>
    );
}
