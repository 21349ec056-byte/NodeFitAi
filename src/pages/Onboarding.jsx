import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft, User, Heart, Target, Activity, Sparkles } from 'lucide-react';

const STEPS = [
    { id: 'basic', title: 'Basic Info', icon: User },
    { id: 'body', title: 'Body Metrics', icon: Activity },
    { id: 'goal', title: 'Your Goal', icon: Target },
];

const GOALS = [
    'Weight Loss', 'Build Muscle', 'Improve Endurance',
    'Heart Health', 'Better Sleep', 'Reduce Stress',
    'General Wellness', 'Other'
];

export default function Onboarding() {
    const { setupProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCustomGoal, setShowCustomGoal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        age: '',
        height: '',
        weight: '',
        goal: '',
        customGoal: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGoalSelect = (goal) => {
        if (goal === 'Other') {
            setShowCustomGoal(true);
            setFormData(prev => ({ ...prev, goal: '' }));
        } else {
            setShowCustomGoal(false);
            setFormData(prev => ({ ...prev, goal, customGoal: '' }));
        }
    };

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(s => s - 1);
        }
    };

    const handleSkip = () => {
        navigate('/app/dashboard');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const finalData = {
                ...formData,
                goal: showCustomGoal ? formData.customGoal : formData.goal,
            };
            delete finalData.customGoal;
            await setupProfile(finalData);
            navigate('/app/dashboard');
        } catch (err) {
            console.error('Profile setup failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const StepIcon = STEPS[step].icon;

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                {/* Progress */}
                <div className="onboarding-progress">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className={`progress-step ${i <= step ? 'active' : ''}`}>
                            <div className="step-circle">{i + 1}</div>
                            <span className="step-label">{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="onboarding-content">
                    <div className="step-header">
                        <StepIcon size={24} />
                        <h2>{STEPS[step].title}</h2>
                    </div>

                    {step === 0 && (
                        <div className="step-form fade-in">
                            <div className="form-group">
                                <label>What should we call you?</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <div className="gender-options">
                                    {['Male', 'Female', 'Other'].map(g => (
                                        <button
                                            type="button"
                                            key={g}
                                            className={`option-btn ${formData.gender === g ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                                        >
                                            {g === 'Female' && <Heart size={16} />}
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="step-form fade-in">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        placeholder="25"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Height (cm)</label>
                                    <input
                                        type="number"
                                        name="height"
                                        placeholder="170"
                                        value={formData.height}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        placeholder="65"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-form fade-in">
                            <div className="form-group">
                                <label>What's your primary health goal?</label>
                                <div className="goal-grid">
                                    {GOALS.map(goal => (
                                        <button
                                            type="button"
                                            key={goal}
                                            className={`goal-btn ${(goal === 'Other' && showCustomGoal) || formData.goal === goal ? 'selected' : ''
                                                }`}
                                            onClick={() => handleGoalSelect(goal)}
                                        >
                                            {goal}
                                        </button>
                                    ))}
                                </div>
                                {showCustomGoal && (
                                    <input
                                        type="text"
                                        name="customGoal"
                                        placeholder="Enter your goal..."
                                        value={formData.customGoal}
                                        onChange={handleChange}
                                        className="input-field mt-1"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="onboarding-actions">
                    <button className="btn-text" onClick={handleSkip}>
                        Skip for now
                    </button>
                    <div className="action-buttons">
                        {step > 0 && (
                            <button className="btn-secondary" onClick={handleBack}>
                                <ChevronLeft size={18} /> Back
                            </button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button className="btn-primary" onClick={handleNext}>
                                Next <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : <>Complete <Sparkles size={18} /></>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
