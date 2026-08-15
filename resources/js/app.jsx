import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/hello')
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching API:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top, #0f172a, #020617)',
            color: '#f8fafc',
            margin: 0,
            padding: '2rem'
        }}>
            <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '2.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                maxWidth: '480px',
                width: '100%',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    marginBottom: '1rem',
                    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Laravel + React + Vite Setup
                </h1>
                
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                    A clean development environment configured with Vite.
                </p>

                <div style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'left'
                }}>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: '#38bdf8', marginBottom: '0.5rem' }}>
                        API Status Check:
                    </strong>
                    {loading ? (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Fetching data from API...</div>
                    ) : data ? (
                        <div>
                            <div style={{ color: '#4ade80', fontWeight: '600', marginBottom: '0.25rem' }}>
                                Connect Success!
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#e2e8f0' }}>
                                {JSON.stringify(data, null, 2)}
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#f87171' }}>Failed to connect to API.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
