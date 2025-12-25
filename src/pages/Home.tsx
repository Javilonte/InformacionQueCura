import { ArrowRight, Shield, Zap, Database, Layers } from 'lucide-react';
import '../styles/index.css';
import { ShapeShifter } from '../components/ui/ShapeShifter';
import { SEO } from '../components/SEO';
import { lazy, Suspense } from 'react';

const DataCleaner = lazy(() => import('../components/DataCleaner').then(module => ({ default: module.DataCleaner })));

export function Home() {
    return (
        <div className="home-page" style={{ position: 'relative', overflow: 'hidden' }}>

            {/* Background Grid Effect */}
            <SEO
                title="Inicio"
                description="InformacionQueCura - Transformamos tus datos en activos de inteligencia empresarial. Limpieza, estandarización y enriquecimiento de datos."
            />
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
          linear-gradient(to right, #504c4cff 1px, transparent 1px),
          linear-gradient(to bottom, #8b8b8bff 1px, transparent 1px)
        `,
                backgroundSize: '40px 40px',
                maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                zIndex: -1,
                opacity: 0.3
            }} />

            {/* Hero Section */}
            <section className="hero" style={{
                padding: '120px 20px',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '100px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--color-accent)',
                        marginBottom: 'var(--spacing-lg)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        letterSpacing: '0.05em'
                    }}>
                        NUEVA ERA EN LIMPIEZA DE DATOS
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                        fontWeight: '700',
                        lineHeight: '1',
                        marginBottom: 'var(--spacing-lg)',
                        letterSpacing: '-0.03em'
                    }}>
                        Tus datos
                        <span className="text-gradient"> perfeccionados.</span>
                        <ShapeShifter />
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--color-text-dim)',
                        marginBottom: 'var(--spacing-xl)',
                        maxWidth: '600px',
                        margin: '0 auto var(--spacing-xl)'
                    }}>
                        La plataforma definitiva para transformar bases de datos caóticas en activos de inteligencia empresarial.
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                        <button style={{
                            backgroundColor: 'white',
                            color: 'black',
                            padding: '14px 28px',
                            borderRadius: '2px',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}>
                            Comenzar Ahora <ArrowRight size={18} />
                        </button>
                        <button style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                            padding: '14px 28px',
                            borderRadius: '2px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Ver Documentación
                        </button>
                    </div>
                </div>


                <div className="mt-24 px-4 pb-20 container mx-auto bg">
                    <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}>Cargando Motor de Limpieza...</div>}>
                        <DataCleaner />
                    </Suspense>
                </div>
            </section >

            {/* Feature Grid (Bento Box Style) */}
            <section style={{ padding: 'var(--spacing-xl) 20px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xl)', textAlign: 'left' }}>Core Capabilities</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '1px',
                        backgroundColor: 'var(--color-border)', // Trick for thin borders
                        border: '1px solid var(--color-border)'
                    }}>
                        <FeatureCard
                            icon={<Shield size={24} color="var(--color-primary)" />}
                            title="Seguridad de Grado Militar"
                            description="Encriptación de extremo a extremo para tus assets más valiosos."
                        />
                        <FeatureCard
                            icon={<Zap size={24} color="var(--color-primary)" />}
                            title="Latencia Cero"
                            description="Pipeline de limpieza optimizado para performance en tiempo real."
                        />
                        <FeatureCard
                            icon={<Database size={24} color="var(--color-primary)" />}
                            title="Integridad Estructural"
                            description="Validación esquemática automática para consistencia total."
                        />
                        <FeatureCard
                            icon={<Layers size={24} color="var(--color-primary)" />}
                            title="Enriquecimiento Contextual"
                            description="Agrega capas de inteligencia a tus datos crudos existentes."
                        />
                    </div>
                </div>
            </section >
        </div >
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div style={{
            padding: 'var(--spacing-xl)',
            backgroundColor: 'var(--color-bg)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
            }} />

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>{icon}</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.25rem' }}>{title}</h3>
            <p style={{ fontSize: '1rem' }}>{description}</p>
        </div>
    )
}
