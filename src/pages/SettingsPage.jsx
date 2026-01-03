import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Settings, User, Palette, Save, Check } from 'lucide-react';
import { updateProfile } from '../lib/db';

export default function SettingsPage() {
    const { profile, user, refreshProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        age: profile?.age || '',
        height: profile?.height || '',
        weight: profile?.weight || '',
        goal: profile?.goal || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
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

            {/* Profile Section */}
            <section className="settings-section">
                <h2><User size={18} /> Profile</h2>
                <div className="settings-card">
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
                    <div className="form-row-3">
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
                        <label>Goal</label>
                        <input
                            type="text"
                            name="goal"
                            value={formData.goal}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {saved ? <><Check size={18} /> Saved</> : isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
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

            {/* Data Section */}
            <section className="settings-section">
                <h2>Data</h2>
                <div className="settings-card">
                    <p className="text-muted">All your data is stored locally on this device.</p>
                </div>
            </section>
        </div>
    );
}
