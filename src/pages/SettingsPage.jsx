import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Settings, User, Palette, Save, Check, Heart, Activity,
    Coffee, Moon, Utensils, Dumbbell, Smartphone
} from 'lucide-react';
import { updateProfile } from '../lib/db';

const DIET_TYPES = ['Vegetarian', 'Vegan', 'Non-Veg', 'Keto', 'Paleo', 'Mediterranean', 'No Preference'];
const ACTIVITY_LEVELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete'];
const SLEEP_QUALITY = ['Poor', 'Fair', 'Good', 'Excellent'];
const GOALS = ['Weight Loss', 'Build Muscle', 'Improve Endurance', 'Heart Health', 'Better Sleep', 'Reduce Stress', 'General Wellness'];

export default function SettingsPage() {
    const { profile, user, refreshProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const [formData, setFormData] = useState({
        // Basic
        name: '',
        gender: '',
        age: '',
        // Body
        height: '',
        weight: '',
        targetWeight: '',
        // Lifestyle
        dietType: '',
        mealsPerDay: '3',
        waterIntake: '4',
        caffeineIntake: '2',
        screenTime: '4',
        // Health
        activityLevel: '',
        exerciseFrequency: '3',
        sleepHours: '7',
        sleepQuality: '',
        avgSteps: '',
        avgHeartRate: '',
        // Habits
        alcoholFrequency: 'Rarely',
        smokingStatus: 'Never',
        substanceUse: 'Never',
        // Accessibility
        hasDisability: false,
        disabilityDetails: '',
        hasJobConstraints: false,
        hasChronicCondition: false,
        chronicConditionDetails: '',
        // Medical
        medicalConditions: '',
        allergies: '',
        // Goal
        goal: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                gender: profile.gender || '',
                age: profile.age || '',
                height: profile.height || '',
                weight: profile.weight || '',
                targetWeight: profile.targetWeight || '',
                dietType: profile.dietType || '',
                mealsPerDay: profile.mealsPerDay || '3',
                waterIntake: profile.waterIntake || '4',
                caffeineIntake: profile.caffeineIntake || '2',
                screenTime: profile.screenTime || '4',
                activityLevel: profile.activityLevel || '',
                exerciseFrequency: profile.exerciseFrequency || '3',
                sleepHours: profile.sleepHours || '7',
                sleepQuality: profile.sleepQuality || '',
                avgSteps: profile.avgSteps || '',
                avgHeartRate: profile.avgHeartRate || '',
                alcoholFrequency: profile.alcoholFrequency || 'Rarely',
                smokingStatus: profile.smokingStatus || 'Never',
                substanceUse: profile.substanceUse || 'Never',
                hasDisability: profile.hasDisability || false,
                disabilityDetails: profile.disabilityDetails || '',
                hasJobConstraints: profile.hasJobConstraints || false,
                hasChronicCondition: profile.hasChronicCondition || false,
                chronicConditionDetails: profile.chronicConditionDetails || '',
                medicalConditions: profile.medicalConditions || '',
                allergies: profile.allergies || '',
                goal: profile.goal || '',
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setSaved(false);
    };

    const handleSelect = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            await updateProfile(profile.id, formData);
            await refreshProfile();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User },
        { id: 'body', label: 'Body', icon: Activity },
        { id: 'lifestyle', label: 'Lifestyle', icon: Coffee },
        { id: 'health', label: 'Health', icon: Heart },
        { id: 'habits', label: 'Habits', icon: Moon },
    ];

    return (
        <div className="settings-page fade-in">
            <h1><Settings size={24} /> Settings</h1>

            {/* Account Section */}
            <section className="settings-section">
                <h2><User size={18} /> Account</h2>
                <div className="settings-card">
                    <div className="setting-item">
                        <span className="setting-label">Email</span>
                        <span className="setting-value">{user?.email}</span>
                    </div>
                </div>
            </section>

            {/* Theme Section */}
            <section className="settings-section">
                <h2><Palette size={18} /> Appearance</h2>
                <div className="settings-card">
                    <div className="theme-options">
                        <button
                            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => setTheme('light')}
                        >
                            <div className="theme-preview light-preview" />
                            <span>Light</span>
                        </button>
                        <button
                            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => setTheme('dark')}
                        >
                            <div className="theme-preview dark-preview" />
                            <span>Dark</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Profile Edit Section */}
            <section className="settings-section">
                <h2>✏️ Edit Profile</h2>

                {/* Tabs */}
                <div className="settings-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="settings-card edit-card">
                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <div className="tab-content fade-in">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
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
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Goal</label>
                                <div className="option-grid-wrap">
                                    {GOALS.map(g => (
                                        <button
                                            type="button"
                                            key={g}
                                            className={`option-btn-sm ${formData.goal === g ? 'selected' : ''}`}
                                            onClick={() => handleSelect('goal', g)}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Body Tab */}
                    {activeTab === 'body' && (
                        <div className="tab-content fade-in">
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Height (cm)</label>
                                    <input
                                        type="number"
                                        name="height"
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
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Target Weight (kg)</label>
                                <input
                                    type="number"
                                    name="targetWeight"
                                    value={formData.targetWeight}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    )}

                    {/* Lifestyle Tab */}
                    {activeTab === 'lifestyle' && (
                        <div className="tab-content fade-in">
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
                                    <label>Meals/day</label>
                                    <input type="number" name="mealsPerDay" value={formData.mealsPerDay} onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-group">
                                    <label>Water (glasses)</label>
                                    <input type="number" name="waterIntake" value={formData.waterIntake} onChange={handleChange} className="input-field" />
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label><Coffee size={16} /> Caffeine (cups)</label>
                                    <input type="number" name="caffeineIntake" value={formData.caffeineIntake} onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-group">
                                    <label><Smartphone size={16} /> Screen time (hrs)</label>
                                    <input type="number" name="screenTime" value={formData.screenTime} onChange={handleChange} className="input-field" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Health Tab */}
                    {activeTab === 'health' && (
                        <div className="tab-content fade-in">
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
                                    <input type="number" name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} className="input-field" min="0" max="7" />
                                </div>
                                <div className="form-group">
                                    <label><Moon size={16} /> Sleep (hrs)</label>
                                    <input type="number" name="sleepHours" value={formData.sleepHours} onChange={handleChange} className="input-field" />
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
                                    <input type="number" name="avgSteps" value={formData.avgSteps} onChange={handleChange} className="input-field" />
                                </div>
                                <div className="form-group">
                                    <label><Heart size={16} /> Resting Heart Rate</label>
                                    <input type="number" name="avgHeartRate" value={formData.avgHeartRate} onChange={handleChange} className="input-field" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Medical Conditions</label>
                                <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} className="input-field" rows="2" />
                            </div>
                            <div className="form-group">
                                <label>Allergies</label>
                                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="input-field" />
                            </div>
                        </div>
                    )}

                    {/* Habits Tab */}
                    {activeTab === 'habits' && (
                        <div className="tab-content fade-in">
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
                                <label>💊 Substance Use</label>
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

                            <div className="accessibility-section">
                                <h3 className="section-subtitle">♿ Accessibility</h3>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input type="checkbox" name="hasDisability" checked={formData.hasDisability} onChange={handleChange} />
                                        I have a physical disability
                                    </label>
                                    {formData.hasDisability && (
                                        <input type="text" name="disabilityDetails" value={formData.disabilityDetails} onChange={handleChange} className="input-field mt-1" placeholder="Details..." />
                                    )}
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input type="checkbox" name="hasJobConstraints" checked={formData.hasJobConstraints} onChange={handleChange} />
                                        Job requires extended screen time
                                    </label>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input type="checkbox" name="hasChronicCondition" checked={formData.hasChronicCondition} onChange={handleChange} />
                                        I have a chronic condition
                                    </label>
                                    {formData.hasChronicCondition && (
                                        <input type="text" name="chronicConditionDetails" value={formData.chronicConditionDetails} onChange={handleChange} className="input-field mt-1" placeholder="Details..." />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        className="btn-primary btn-full mt-1"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {saved ? <><Check size={18} /> Saved!</> : isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </section>

            {/* Data Section */}
            <section className="settings-section">
                <h2>🔒 Data Privacy</h2>
                <div className="settings-card">
                    <p className="text-muted">All your data is stored locally on this device. We never send your health information to external servers.</p>
                </div>
            </section>
        </div>
    );
}
