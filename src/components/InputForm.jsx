import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Activity, Heart, User, Sun, Utensils, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { getEnvironmentalData } from '../utils/locationService';
import { saveCurrentFormData, loadCurrentFormData } from '../utils/storageService';

const STEPS = [
    { id: 'profile', title: 'User Profile', icon: User, subtitle: 'Tell us about yourself' },
    { id: 'lifestyle', title: 'Lifestyle & Habits', icon: Utensils, subtitle: 'Your daily routines' },
    { id: 'medical', title: 'Medical Background', icon: Activity, subtitle: 'Health history' },
    { id: 'wearable', title: 'Wearable Data', icon: Heart, subtitle: 'Fitness metrics' },
    { id: 'environment', title: 'Context & Goals', icon: Sun, subtitle: 'Your environment & objectives' },
];

const DROPDOWN_OPTIONS = {
    gender: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
    blood_group: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    food_habits: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Mediterranean', 'No Preference'],
    activity_level: ['Sedentary (little to no exercise)', 'Lightly Active (1-3 days/week)', 'Moderately Active (3-5 days/week)', 'Very Active (6-7 days/week)', 'Athlete (2x per day)'],
    stress_data: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
    goal: ['Weight Loss', 'Build Muscle', 'Improve Endurance', 'Heart Health', 'Better Sleep', 'Reduce Stress', 'General Wellness', 'Manage Chronic Condition'],
};

const INITIAL_DATA = {
    name: '', age: '', gender: '', height: '', weight: '', blood_group: '',
    food_habits: '', activity_level: '', sleep_hours: '', screen_time: '', headphone_time: '', habits_optional: '',
    medical_conditions: '', past_conditions: '', medications: '', medical_reports: '',
    steps: '', distance: '', calories: '', heart_rate: '', sleep_data: '', ecg: '', stress_data: '',
    location: '', weather: '', aqi: '', goal: ''
};

export default function InputForm({ onSubmit }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(INITIAL_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    const StepIcon = STEPS[currentStep].icon;

    // Load saved form data on mount
    useEffect(() => {
        const savedData = loadCurrentFormData();
        if (savedData) {
            setFormData(savedData);
        }
    }, []);

    // Save form data on every change
    useEffect(() => {
        saveCurrentFormData(formData);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDetectLocation = async () => {
        setIsLoadingLocation(true);
        setLocationError('');

        try {
            const envData = await getEnvironmentalData();
            if (envData.success) {
                setFormData(prev => ({
                    ...prev,
                    location: envData.location,
                    weather: envData.weather,
                    aqi: String(envData.aqi),
                }));
            } else {
                setLocationError(envData.error || 'Failed to detect location');
            }
        } catch (error) {
            setLocationError(error.message || 'Failed to detect location');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            setIsSubmitting(true);
            await onSubmit(formData);
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1);
        }
    };

    const renderField = (name, label, type = "text", placeholder = "") => (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <input
                type={type}
                name={name}
                className="input-field"
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
            />
        </div>
    );

    const renderDropdown = (name, label, options) => (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <select
                name={name}
                className="input-field select-field"
                value={formData[name]}
                onChange={handleChange}
            >
                <option value="">Select an option...</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );

    const getProgress = () => ((currentStep + 1) / STEPS.length) * 100;

    return (
        <div className="glass-panel fade-in form-container">
            {/* Animated Progress Ring */}
            <div className="progress-header">
                <div className="progress-ring-container">
                    <svg className="progress-ring" viewBox="0 0 36 36">
                        <path
                            className="progress-ring-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="progress-ring-fill"
                            strokeDasharray={`${getProgress()}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className="progress-ring-text">{currentStep + 1}/{STEPS.length}</div>
                </div>
                <div className="progress-info">
                    <h2 className="step-title">
                        <StepIcon size={24} className="step-icon" />
                        {STEPS[currentStep].title}
                    </h2>
                    <p className="step-subtitle">{STEPS[currentStep].subtitle}</p>
                </div>
            </div>

            {/* Step Indicators */}
            <div className="step-indicators">
                {STEPS.map((s, idx) => (
                    <div
                        key={s.id}
                        className={`step-dot ${idx < currentStep ? 'completed' : ''} ${idx === currentStep ? 'active' : ''}`}
                        title={s.title}
                    />
                ))}
            </div>

            <div className="form-content fade-in" key={currentStep}>
                {currentStep === 0 && (
                    <div className="form-grid">
                        {renderField('name', '👤 Your Name', 'text', 'Enter your name')}
                        {renderField('age', '🎂 Age', 'number', '25')}
                        {renderDropdown('gender', '⚧ Gender', DROPDOWN_OPTIONS.gender)}
                        {renderDropdown('blood_group', '🩸 Blood Group', DROPDOWN_OPTIONS.blood_group)}
                        {renderField('height', '📏 Height (cm)', 'text', '175')}
                        {renderField('weight', '⚖️ Weight (kg)', 'text', '70')}
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="form-stack">
                        {renderDropdown('food_habits', '🍽️ Food Preferences', DROPDOWN_OPTIONS.food_habits)}
                        {renderDropdown('activity_level', '🏃 Daily Activity Level', DROPDOWN_OPTIONS.activity_level)}
                        <div className="form-grid">
                            {renderField('sleep_hours', '😴 Avg Sleep (hours)', 'number', '7')}
                            {renderField('screen_time', '📱 Screen Time (hours)', 'number', '5')}
                        </div>
                        {renderField('headphone_time', '🎧 Headphone Usage (hours/day)', 'number', '2')}
                        {renderField('habits_optional', '🚬 Smoking / Alcohol Habits', 'text', 'None, Occasional, Regular...')}
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="form-stack">
                        <div className="info-banner">
                            <Sparkles size={16} />
                            <span>This information helps us personalize your health insights. All data stays private.</span>
                        </div>
                        {renderField('medical_conditions', '🩺 Existing Conditions', 'text', 'Diabetes, Hypertension, None...')}
                        {renderField('past_conditions', '📋 Past Medical History', 'text', 'Surgeries, injuries...')}
                        {renderField('medications', '💊 Current Medications', 'text', 'List any medications...')}
                        <div className="form-group">
                            <label className="form-label">📄 Medical Report Summary (Optional)</label>
                            <textarea
                                name="medical_reports"
                                className="input-field textarea-field"
                                rows="3"
                                placeholder="Paste any relevant details from recent reports..."
                                value={formData.medical_reports}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="form-stack">
                        <div className="info-banner success">
                            <Heart size={16} />
                            <span>Sync data from your smartwatch or fitness tracker for best results!</span>
                        </div>
                        <div className="form-grid">
                            {renderField('steps', '👟 Daily Steps', 'number', '8000')}
                            {renderField('distance', '📍 Distance (km)', 'number', '5')}
                        </div>
                        {renderField('calories', '🔥 Calories Burned', 'number', '400')}
                        {renderField('heart_rate', '❤️ Heart Rate (resting, peak)', 'text', 'Resting: 65, Peak: 140')}
                        {renderField('sleep_data', '🌙 Sleep Quality Details', 'text', 'Deep: 2h, Light: 4h, REM: 1.5h')}
                        {renderDropdown('stress_data', '🧘 Stress Level', DROPDOWN_OPTIONS.stress_data)}
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="form-stack">
                        {/* Auto-detect Location Button */}
                        <div className="location-detect-section">
                            <button
                                type="button"
                                onClick={handleDetectLocation}
                                className="btn-detect"
                                disabled={isLoadingLocation}
                            >
                                {isLoadingLocation ? (
                                    <><Loader2 size={18} className="spin" /> Detecting...</>
                                ) : (
                                    <><MapPin size={18} /> Auto-Detect My Location & Weather</>
                                )}
                            </button>
                            {locationError && <p className="error-text">{locationError}</p>}
                            {formData.location && !locationError && (
                                <p className="success-text">📍 {formData.location} • {formData.weather} • AQI: {formData.aqi}</p>
                            )}
                        </div>

                        <div className="divider-text">
                            <span>or enter manually</span>
                        </div>

                        {renderField('location', '📍 Your Location', 'text', 'New York, USA')}
                        <div className="form-grid">
                            {renderField('weather', '🌤️ Current Weather', 'text', 'Sunny, 28°C')}
                            {renderField('aqi', '🌫️ Air Quality Index', 'number', '45')}
                        </div>

                        <div className="goal-section">
                            <label className="form-label goal-label">🎯 What's Your Primary Health Goal?</label>
                            <div className="goal-grid">
                                {DROPDOWN_OPTIONS.goal.map(g => (
                                    <button
                                        type="button"
                                        key={g}
                                        className={`goal-chip ${formData.goal === g ? 'selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, goal: g }))}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="form-actions">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="btn-secondary"
                >
                    <ChevronLeft size={18} /> Back
                </button>
                <button
                    onClick={handleNext}
                    className="btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="loading-text">Analyzing<span className="dots">...</span></span>
                    ) : currentStep === STEPS.length - 1 ? (
                        <>Generate Insights <Sparkles size={18} /></>
                    ) : (
                        <>Continue <ChevronRight size={18} /></>
                    )}
                </button>
            </div>
        </div>
    );
}
