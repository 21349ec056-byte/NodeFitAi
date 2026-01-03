import { useState } from 'react';
import { Key } from 'lucide-react';

export default function ApiKeyModal({ onSave }) {
    const [inputKey, setInputKey] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputKey.trim()) {
            onSave(inputKey.trim());
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
        }}>
            <div className="glass-panel fade-in" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        width: '48px', height: '48px',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem auto',
                        color: 'var(--color-brand)'
                    }}>
                        <Key size={24} />
                    </div>
                    <h2>Access nodeFit AI</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Enter your Google Gemini API Key to activate the health intelligence engine.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Paste your API Key here..."
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            autoFocus
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Your key is stored locally in your browser.
                        </p>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Connect to Neural Core
                    </button>
                </form>
            </div>
        </div>
    );
}
