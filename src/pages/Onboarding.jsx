import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ChevronRight, ChevronLeft, User, Heart, Target, Activity,
    Sparkles, Utensils, Moon, Smartphone, Dumbbell, Coffee
} from 'lucide-react';

const STEPS = [
    { id: 'basic', title: 'Basic Info', icon: User },
    { id: 'body', title: 'Body Metrics', icon: Activity },
    { id: 'habits', title: 'Lifestyle', icon: Coffee },
    { id: 'health', title: 'Health Data', icon: Heart },
    { id: 'goal', title: 'Your Goal', icon: Target },
];

const GOALS = [
    'Weight Loss', 'Build Muscle', 'Improve Endurance',
    'Heart Health', 'Better Sleep', 'Reduce Stress',
    'General Wellness', 'Other'
];

const DIET_TYPES = ['Vegetarian', 'Vegan', 'Non-Veg', 'Keto', 'Paleo', 'Mediterranean', 'No Preference'];
const ACTIVITY_LEVELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete'];
const SLEEP_QUALITY = ['Poor', 'Fair', 'Good', 'Excellent'];

export default function Onboarding() {
    const { setupProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCustomGoal, setShowCustomGoal] = useState(false);
    const [formData, setFormData] = useState({
        // Basic
        name: '',
        gender: '',
        age: '',
        // Body
        height: '',
        weight: '',
        // Lifestyle habits
        dietType: '',
        mealsPerDay: '3',
        waterIntake: '4',
        caffeineIntake: '2',
        alcoholFrequency: 'Rarely',
        smokingStatus: 'Never',
        // Screen & Activity
        screenTime: '4',
        activityLevel: '',
        exerciseFrequency: '3',
        sleepHours: '7',
        sleepQuality: '',
        // Health data (manual or from wearable)
        avgSteps: '',
        avgHeartRate: '',
        hasWearable: false,
        wearableType: '',
        // Medical
        medicalConditions: '',
        allergies: '',
        medications: '',
        // Goal
        goal: '',
        customGoal: '',
        targetWeight: '',
        substanceUse: 'Never',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelect = (name, value) => {
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
        if (step < STEPS.length - 1) setStep(s => s + 1);
    };

    const handleBack = () => {
        if (step > 0) setStep(s => s - 1);
    };

    const handleSkip = () => navigate('/app/dashboard');

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

                    {/* Step 1: Basic Info */}
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
                                <div className="option-grid-3">
                                    {['Male', 'Female', 'Other'].map(g => (
                                        <button
                                            type="button"
                                            key={g}
                                            className={`option-btn ${formData.gender === g ? 'selected' : ''}`}
                                            onClick={() => handleSelect('gender', g)}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                        </div>
                    )}

                    {/* Step 2: Body Metrics */}
                    {step === 1 && (
                        <div className="step-form fade-in">
                            <div className="form-row-2">
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
                                    <label>Current Weight (kg)</label>
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
                            <div className="form-group">
                                <label>Target Weight (kg) - Optional</label>
                                <input
                                    type="number"
                                    name="targetWeight"
                                    placeholder="60"
                                    value={formData.targetWeight}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Lifestyle & Habits */}
                    {step === 2 && (
                        <div className="step-form fade-in">
                            <div className="form-group">
                                <label><Utensils size={16} /> Diet Type</label>
                                <div className="option-grid-wrap">
                                    {DIET_TYPES.map(d => (
                                        <button
                                            type="button"
                                            key={d}
                                            className={`option-btn-sm ${formData.dietType === d ? 'selected' : ''}`}
                                            onClick={() => handleSelect('dietType', d)}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Meals per day</label>
                                    <input
                                        type="number"
                                        name="mealsPerDay"
                                        value={formData.mealsPerDay}
                                        onChange={handleChange}
                                        className="input-field"
                                        min="1"
                                        max="10"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Water (glasses/day)</label>
                                    <input
                                        type="number"
                                        name="waterIntake"
                                        value={formData.waterIntake}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label><Coffee size={16} /> Caffeine (cups/day)</label>
                                    <input
                                        type="number"
                                        name="caffeineIntake"
                                        value={formData.caffeineIntake}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Smartphone size={16} /> Screen time (hrs)</label>
                                    <input
                                        type="number"
                                        name="screenTime"
                                        value={formData.screenTime}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Health Data */}
                    {step === 3 && (
                        <div className="step-form fade-in">
                            <div className="form-group">
                                <label><Dumbbell size={16} /> Activity Level</label>
                                <div className="option-grid-wrap">
                                    {ACTIVITY_LEVELS.map(a => (
                                        <button
                                            type="button"
                                            key={a}
                                            className={`option-btn-sm ${formData.activityLevel === a ? 'selected' : ''}`}
                                            onClick={() => handleSelect('activityLevel', a)}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Exercise (days/week)</label>
                                    <input
                                        type="number"
                                        name="exerciseFrequency"
                                        value={formData.exerciseFrequency}
                                        onChange={handleChange}
                                        className="input-field"
                                        min="0"
                                        max="7"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Moon size={16} /> Sleep (hrs/night)</label>
                                    <input
                                        type="number"
                                        name="sleepHours"
                                        value={formData.sleepHours}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Sleep Quality</label>
                                <div className="option-grid-4">
                                    {SLEEP_QUALITY.map(q => (
                                        <button
                                            type="button"
                                            key={q}
                                            className={`option-btn-sm ${formData.sleepQuality === q ? 'selected' : ''}`}
                                            onClick={() => handleSelect('sleepQuality', q)}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Avg Daily Steps</label>
                                    <input
                                        type="number"
                                        name="avgSteps"
                                        placeholder="5000"
                                        value={formData.avgSteps}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Heart size={16} /> Resting Heart Rate</label>
                                    <input
                                        type="number"
                                        name="avgHeartRate"
                                        placeholder="72"
                                        value={formData.avgHeartRate}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="hasWearable"
                                        checked={formData.hasWearable}
                                        onChange={handleChange}
                                    />
                                    I have a fitness wearable/smartwatch
                                </label>
                                {formData.hasWearable && (
                                    <input
                                        type="text"
                                        name="wearableType"
                                        placeholder="e.g., Apple Watch, Fitbit, Garmin"
                                        value={formData.wearableType}
                                        onChange={handleChange}
                                        className="input-field mt-1"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Goal & Habits */}
                    {step === 4 && (
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

                            <div className="habits-section">
                                <h3 className="section-subtitle">Your Habits</h3>
                                <p className="text-muted small">This helps us personalize health advice</p>

                                <div className="form-group">
                                    <label>🍷 Alcohol Consumption</label>
                                    <div className="option-grid-wrap">
                                        {['Never', 'Rarely', 'Occasionally', 'Weekly', 'Daily'].map(opt => (
                                            <button
                                                type="button"
                                                key={opt}
                                                className={`option-btn-sm ${formData.alcoholFrequency === opt ? 'selected' : ''}`}
                                                onClick={() => handleSelect('alcoholFrequency', opt)}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>🚬 Smoking Status</label>
                                    <div className="option-grid-wrap">
                                        {['Never', 'Former', 'Occasional', 'Regular'].map(opt => (
                                            <button
                                                type="button"
                                                key={opt}
                                                className={`option-btn-sm ${formData.smokingStatus === opt ? 'selected' : ''}`}
                                                onClick={() => handleSelect('smokingStatus', opt)}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>💊 Recreational Substance Use</label>
                                    <div className="option-grid-wrap">
                                        {['Never', 'Former', 'Occasional', 'Regular'].map(opt => (
                                            <button
                                                type="button"
                                                key={opt}
                                                className={`option-btn-sm ${formData.substanceUse === opt ? 'selected' : ''}`}
                                                onClick={() => handleSelect('substanceUse', opt)}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Any medical conditions? (Optional)</label>
                                <textarea
                                    name="medicalConditions"
                                    placeholder="e.g., Diabetes, Hypertension..."
                                    value={formData.medicalConditions}
                                    onChange={handleChange}
                                    className="input-field"
                                    rows="2"
                                />
                            </div>
                            <div className="form-group">
                                <label>Food allergies? (Optional)</label>
                                <input
                                    type="text"
                                    name="allergies"
                                    placeholder="e.g., Peanuts, Gluten..."
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="onboarding-actions">
                    <div className="step-indicator">Step {step + 1} of {STEPS.length}</div>
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
