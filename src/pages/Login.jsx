import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { deleteProfile } from '../lib/db';

export default function Login() {
    const { profiles, login, refreshProfiles } = useAuth();
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(null);

    const handleSelectProfile = async (profileId) => {
        await login(profileId);
        navigate('/dashboard');
    };

    const handleDeleteProfile = async (e, profileId) => {
        e.stopPropagation();
        if (confirm('Delete this profile and all its data?')) {
            setIsDeleting(profileId);
            await deleteProfile(profileId);
            await refreshProfiles();
            setIsDeleting(null);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container fade-in">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="brand-dot" />
                        <h1>nodeFit <span>AI</span></h1>
                    </div>
                    <p className="auth-subtitle">Select your profile to continue</p>
                </div>

                {profiles.length > 0 ? (
                    <div className="profile-list">
                        {profiles.map((profile) => (
                            <button
                                key={profile.id}
                                className="profile-card"
                                onClick={() => handleSelectProfile(profile.id)}
                                disabled={isDeleting === profile.id}
                            >
                                <div className="profile-avatar">
                                    <User size={24} />
                                </div>
                                <div className="profile-info">
                                    <span className="profile-name">{profile.name}</span>
                                    <span className="profile-meta">
                                        {profile.gender} • {profile.goal || 'General Wellness'}
                                    </span>
                                </div>
                                <div className="profile-actions">
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => handleDeleteProfile(e, profile.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <ArrowRight size={20} />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="no-profiles">
                        <User size={48} />
                        <p>No profiles yet. Create one to get started!</p>
                    </div>
                )}

                <button
                    className="btn-primary create-profile-btn"
                    onClick={() => navigate('/signup')}
                >
                    <Plus size={20} /> Create New Profile
                </button>
            </div>
        </div>
    );
}
