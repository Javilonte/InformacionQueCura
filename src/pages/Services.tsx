import { Database, Filter, Layers, Search } from 'lucide-react';
import '../styles/index.css';
import { SEO } from '../components/SEO';

export function Services() {
    return (
        <div style={{ padding: 'var(--spacing-2xl) var(--spacing-lg)', maxWidth: '1200px', margin: '0 auto' }}>
            <SEO title="Servicios" description="Limpieza de CRM, Deduplicación y Estandarización de datos." />
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>Nuestros Servicios</h1>
                <p style={{ color: 'var(--color-text-dim)', maxWidth: '600px', margin: '0 auto', fontSize: '1.2rem' }}>
                    Infraestructura de limpieza de datos para la era de la IA.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
                <ServiceItem
                    icon={<Database size={32} color="var(--color-primary)" />}
                    title="Limpieza de CRM"
                    description="Auditoría y limpieza profunda de tu CRM para eliminar registros obsoletos."
                />
                <ServiceItem
                    icon={<Filter size={32} color="var(--color-primary)" />}
                    title="Deduplicación Agresiva"
                    description="Identificación y fusión de registros duplicados con algoritmos difusos."
                />
                <ServiceItem
                    icon={<Layers size={32} color="var(--color-primary)" />}
                    title="Estandarización"
                    description="Normalización de nombres y direcciones bajo estándares ISO."
                />
                <ServiceItem
                    icon={<Search size={32} color="var(--color-primary)" />}
                    title="Enriquecimiento"
                    description="Completado de información faltante cruzando fuentes confiables."
                />
            </div>
        </div>
    );
}

function ServiceItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            transition: 'border-color 0.2s',
            cursor: 'default'
        }}>
            <div style={{ marginBottom: 'var(--spacing-md)', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                {icon}
            </div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.1rem' }}>{title}</h3>
            <p style={{ color: 'var(--color-text-dim)', fontSize: '0.95rem' }}>{description}</p>
        </div>
    )
}
