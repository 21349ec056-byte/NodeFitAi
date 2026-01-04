import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Plus, Calendar, ArrowRight, Sparkles, Droplets, Moon, Sun, AlertCircle } from 'lucide-react';
import { logCycle, getCycles, updateCycle } from '../lib/db';

export default function CycleTracker() {
    const { profile } = useAuth();
    const [cycles, setCycles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCycle, setNewCycle] = useState({ startDate: '', endDate: '', notes: '' });
    const [dateError, setDateError] = useState('');

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const loadCycles = async () => {
            if (profile?.id) {
                const data = await getCycles(profile.id);
                setCycles(data);
            }
        };
        loadCycles();
    }, [profile]);

    const validateDates = () => {
        setDateError('');

        if (!newCycle.startDate) {
            setDateError('Start date is required');
            return false;
        }

        // No future dates allowed
        if (newCycle.startDate > today) {
            setDateError('Start date cannot be in the future');
            return false;
        }

        if (newCycle.endDate) {
            if (newCycle.endDate > today) {
                setDateError('End date cannot be in the future');
                return false;
            }
            if (newCycle.endDate < newCycle.startDate) {
                setDateError('End date must be after start date');
                return false;
            }
        }

        return true;
    };

    const handleAdd = async () => {
        if (!validateDates() || !profile) return;

        await logCycle(profile.id, newCycle.startDate, newCycle.endDate || null, newCycle.notes);
        const updated = await getCycles(profile.id);
        setCycles(updated);
        setShowModal(false);
        setNewCycle({ startDate: '', endDate: '', notes: '' });
        setDateError('');
    };

    const handleEnd = async (cycleId) => {
        await updateCycle(cycleId, { endDate: today });
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

    const getCyclePhase = () => {
        if (cycles.length === 0) return null;
        const lastCycle = cycles[0];
        const lastStart = new Date(lastCycle.startDate);
        const daysSinceStart = Math.floor((new Date() - lastStart) / (1000 * 60 * 60 * 24));

        if (daysSinceStart <= 5) return { phase: 'Menstrual', day: daysSinceStart + 1, color: 'error' };
        if (daysSinceStart <= 13) return { phase: 'Follicular', day: daysSinceStart + 1, color: 'success' };
        if (daysSinceStart <= 16) return { phase: 'Ovulation', day: daysSinceStart + 1, color: 'warning' };
        if (daysSinceStart <= 28) return { phase: 'Luteal', day: daysSinceStart + 1, color: 'info' };
        return { phase: 'Late Luteal', day: daysSinceStart + 1, color: 'warning' };
    };

    const nextPeriod = getNextPrediction();
    const daysUntil = nextPeriod ? Math.ceil((nextPeriod - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const currentPhase = getCyclePhase();

    // Tips based on cycle phase
    const getPhaseTips = () => {
        if (!currentPhase) return [];
        switch (currentPhase.phase) {
            case 'Menstrual':
                return [
                    { icon: '💧', tip: 'Stay hydrated, drink warm water' },
                    { icon: '🛁', tip: 'Take warm baths to ease cramps' },
                    { icon: '🥗', tip: 'Eat iron-rich foods like spinach' },
                    { icon: '😴', tip: 'Prioritize rest and sleep' },
                ];
            case 'Follicular':
                return [
                    { icon: '🏃‍♀️', tip: 'Great time for high-intensity workouts' },
                    { icon: '🥑', tip: 'Focus on protein and healthy fats' },
                    { icon: '🧠', tip: 'Energy is high - tackle big projects' },
                    { icon: '💪', tip: 'Try new fitness challenges' },
                ];
            case 'Ovulation':
                return [
                    { icon: '✨', tip: 'Peak energy - maximize productivity' },
                    { icon: '🥦', tip: 'Eat fiber-rich vegetables' },
                    { icon: '💬', tip: 'Great time for social activities' },
                    { icon: '🏋️', tip: 'Strength training is most effective now' },
                ];
            case 'Luteal':
                return [
                    { icon: '🍫', tip: 'Cravings normal - choose dark chocolate' },
                    { icon: '🧘', tip: 'Switch to yoga and stretching' },
                    { icon: '🌙', tip: 'Improve sleep hygiene' },
                    { icon: '🍌', tip: 'Eat magnesium-rich foods' },
                ];
            default:
                return [
                    { icon: '📅', tip: 'Track your cycle for better predictions' },
                    { icon: '💊', tip: 'Consider a prenatal vitamin' },
                    { icon: '🩺', tip: 'Consult a doctor if cycle is irregular' },
                ];
        }
    };

    const tips = getPhaseTips();

    return (
        <div className="cycle-page fade-in">
            <h1><Heart size={24} /> Menstrual Cycle Tracker</h1>

            {/* Current Phase Card */}
            {currentPhase && (
                <div className={`phase-card ${currentPhase.color}`}>
                    <div className="phase-header">
                        <Moon size={20} />
                        <span className="phase-name">{currentPhase.phase} Phase</span>
                        <span className="phase-day">Day {currentPhase.day}</span>
                    </div>
                </div>
            )}

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

            {/* Tips Section */}
            <section className="tips-section">
                <h2><Sparkles size={18} /> Tips for {currentPhase?.phase || 'Your Cycle'}</h2>
                <div className="tips-grid">
                    {tips.map((item, i) => (
                        <div key={i} className="tip-card">
                            <span className="tip-icon">{item.icon}</span>
                            <span className="tip-text">{item.tip}</span>
                        </div>
                    ))}
                </div>
            </section>

            <button className="btn-primary btn-full" onClick={() => setShowModal(true)}>
                <Plus size={18} /> Log Period
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
                        <h3>Log Period</h3>

                        {dateError && (
                            <div className="error-banner">
                                <AlertCircle size={16} /> {dateError}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={newCycle.startDate}
                                max={today}
                                onChange={e => setNewCycle(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date (optional)</label>
                            <input
                                type="date"
                                className="input-field"
                                value={newCycle.endDate}
                                min={newCycle.startDate}
                                max={today}
                                onChange={e => setNewCycle(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Notes (optional)</label>
                            <textarea
                                className="input-field"
                                rows="2"
                                placeholder="Symptoms, flow, mood..."
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
