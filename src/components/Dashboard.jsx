import { Activity, Moon, Sun, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard({ report, userData }) {
    if (!report) return null;

    return (
        <div className="fade-in" style={{ paddingBottom: '4rem' }}>
            {/* 1. Health Snapshot */}
            <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--text-accent)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Health Snapshot for {userData.name}</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{report.healthSnapshot.summary}</p>
                <div style={{ marginTop: '1rem', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                    Status: <strong>{report.healthSnapshot.status}</strong>
                </div>
            </section>

            {/* 2. Metrics Grid */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {report.metrics.map((metric, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{metric.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-brand)' }}>{metric.value}</div>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{metric.description}</div>
                    </div>
                ))}
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* 3. Recommendations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <TrendingUp size={20} color="var(--color-success)" /> Specialized Recommendations
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {report.recommendations.map((rec, idx) => (
                                <div key={idx} className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 style={{ color: 'var(--text-accent)' }}>{rec.title}</h4>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Impact: {rec.impact}</span>
                                    </div>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{rec.reason}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 4. Lifestyle & Nutrition */}
                    <section className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Lifestyle Optimization</h3>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <strong style={{ color: 'var(--color-brand)' }}>Sleep Strategy</strong>
                                <p>{report.lifestyleOptimization.sleep}</p>
                            </div>
                            <div>
                                <strong style={{ color: 'var(--color-brand)' }}>Nutrition Focus</strong>
                                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                    {report.nutrition.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>💧 {report.nutrition.hydration}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar: Do's/Dont's, Env, Weekly */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Do's and Don'ts */}
                    <section className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Daily Protocol</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ color: 'var(--color-success)', fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ Do This</div>
                            {report.dosAndDonts.dos.map((d, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                    <CheckCircle size={14} style={{ marginTop: 3 }} /> {d}
                                </div>
                            ))}
                        </div>
                        <div>
                            <div style={{ color: 'var(--color-error)', fontWeight: 'bold', marginBottom: '0.5rem' }}>❌ Avoid This</div>
                            {report.dosAndDonts.donts.map((d, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                    <XCircle size={14} style={{ marginTop: 3 }} /> {d}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Environment */}
                    <section className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(0,0,0,0))' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Sun size={20} color="var(--color-warning)" /> Context Alert
                        </h3>
                        <p style={{ fontSize: '0.9rem' }}>{report.environmental.suggestion}</p>
                        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 'bold' }}>Alert Level: {report.environmental.alertLevel}</div>
                    </section>

                    {/* Weekly Plan */}
                    <section className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>7-Day Focus</h3>
                        {report.weeklyPlan.map((day, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.5rem 0' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{day.day}</span>
                                <span style={{ fontWeight: 500 }}>{day.focus}</span>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}
