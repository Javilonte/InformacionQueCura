import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import '../styles/index.css';

export function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Gracias por tu mensaje. Nos pondremos en contacto pronto.');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div style={{ padding: 'var(--spacing-2xl) var(--spacing-lg)', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>Contáctanos</h1>
                <p style={{ color: 'var(--color-text-dim)', fontSize: '1.2rem' }}>Inicia tu transformación de datos hoy.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--spacing-2xl)' }}>

                {/* Contact Info */}
                <div>
                    <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Información</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        <ContactDetail icon={<Mail />} title="Email" content="hola@informacionquecura.com" />
                        <ContactDetail icon={<Phone />} title="Teléfono" content="+52 55 1234 5678" />
                        <ContactDetail icon={<MapPin />} title="Oficina" content="Av. Reforma 222, CDMX" />
                    </div>
                </div>

                {/* Contact Form */}
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '2rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--color-text-dim)' }}>Nombre</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: 'var(--color-bg)',
                                    border: '1px solid var(--color-border)',
                                    color: 'white',
                                    borderRadius: '2px',
                                    outline: 'none'
                                }}
                                placeholder="Tu nombre"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--color-text-dim)' }}>Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: 'var(--color-bg)',
                                    border: '1px solid var(--color-border)',
                                    color: 'white',
                                    borderRadius: '2px',
                                    outline: 'none'
                                }}
                                placeholder="tu@email.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--color-text-dim)' }}>Mensaje</label>
                            <textarea
                                rows={4}
                                required
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: 'var(--color-bg)',
                                    border: '1px solid var(--color-border)',
                                    color: 'white',
                                    borderRadius: '2px',
                                    resize: 'vertical',
                                    outline: 'none'
                                }}
                                placeholder="¿Cómo podemos ayudarte?"
                            />
                        </div>
                        <button type="submit" style={{
                            backgroundColor: 'white',
                            color: 'black',
                            padding: '12px',
                            borderRadius: '2px',
                            border: 'none',
                            fontWeight: '600',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '1rem',
                            cursor: 'pointer'
                        }}>
                            Enviar Mensaje <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function ContactDetail({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div style={{ color: 'var(--color-primary)' }}>{icon}</div>
            <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
                <p style={{ fontWeight: '500', color: 'var(--color-primary)' }}>{content}</p>
            </div>
        </div>
    )
}
