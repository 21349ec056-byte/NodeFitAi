import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Plus, Calendar, ArrowRight } from 'lucide-react';
import { logCycle, getCycles, updateCycle } from '../lib/db';

export default function CycleTracker() {
    const { profile } = useAuth();
    const [cycles, setCycles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCycle, setNewCycle] = useState({ startDate: '', notes: '' });

    useEffect(() => {
        const loadCycles = async () => {
            if (profile?.id) {
                const data = await getCycles(profile.id);
                setCycles(data);
            }
        };
        loadCycles();
    }, [profile]);

    const handleAdd = async () => {
        if (!newCycle.startDate || !profile) return;
        await logCycle(profile.id, newCycle.startDate, null, newCycle.notes);
        const updated = await getCycles(profile.id);
        setCycles(updated);
        setShowModal(false);
        setNewCycle({ startDate: '', notes: '' });
    };

    const handleEnd = async (cycleId) => {
        await updateCycle(cycleId, { endDate: new Date().toISOString().split('T')[0] });
        const updated = await getCycles(profile.id);
        setCycles(updated);
    };

    const getNextPrediction = () => {
        if (cycles.length === 0) return null;
        const lastCycle = cycles[0];
        if (!lastCycle.startDate) return null;
        const lastStart = new Date(lastCycle.startDate);
        const nextStart = new Date(lastStart);
        nextStart.setDate(nextStart.getDate() + 28);
        return nextStart;
    };

    const nextPeriod = getNextPrediction();
    const daysUntil = nextPeriod ? Math.ceil((nextPeriod - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
        <div className="cycle-page fade-in">
            <h1><Heart size={24} /> Cycle Tracker</h1>

            {/* Prediction Card */}
            <div className="prediction-card">
                <div className="prediction-icon">
                    <Calendar size={28} />
                </div>
                <div className="prediction-info">
                    {nextPeriod ? (
                        <>
                            <span className="prediction-label">Next period expected</span>
                            <span className="prediction-date">{nextPeriod.toLocaleDateString()}</span>
                            <span className="prediction-days">
                                {daysUntil > 0 ? `in ${daysUntil} days` : daysUntil === 0 ? 'Today' : `${Math.abs(daysUntil)} days ago`}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="prediction-label">No data yet</span>
                            <span className="prediction-date">Log your first cycle</span>
                        </>
                    )}
                </div>
            </div>

            <button className="btn-primary btn-full" onClick={() => setShowModal(true)}>
                <Plus size={18} /> Log Period Start
            </button>

            {/* History */}
            <section className="cycle-history">
                <h2>History</h2>
                {cycles.length > 0 ? (
                    <div className="cycle-list">
                        {cycles.map(cycle => (
                            <div key={cycle.id} className="cycle-item">
                                <div className="cycle-dates">
                                    <span className="start">{new Date(cycle.startDate).toLocaleDateString()}</span>
                                    <ArrowRight size={14} />
                                    <span className="end">
                                        {cycle.endDate ? (
                                            new Date(cycle.endDate).toLocaleDateString()
                                        ) : (
                                            <button className="btn-sm" onClick={() => handleEnd(cycle.id)}>Mark End</button>
                                        )}
                                    </span>
                                </div>
                                {cycle.notes && <p className="cycle-notes">{cycle.notes}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state-card">
                        <Heart size={32} />
                        <p>No cycles logged yet</p>
                    </div>
                )}
            </section>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3>Log Period Start</h3>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={newCycle.startDate}
                                onChange={e => setNewCycle(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Notes (optional)</label>
                            <textarea
                                className="input-field"
                                rows="2"
                                placeholder="Any symptoms..."
                                value={newCycle.notes}
                                onChange={e => setNewCycle(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleAdd}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
