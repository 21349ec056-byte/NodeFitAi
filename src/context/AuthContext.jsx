import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getProfileByUserId, createUser, authenticateUser, createProfile, updateStreak } from '../lib/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved session on mount
    useEffect(() => {
        const loadSession = async () => {
            const savedUserId = localStorage.getItem('nodefit_user_id');
            if (savedUserId) {
                try {
                    const userData = await getUser(parseInt(savedUserId));
                    if (userData) {
                        setUser(userData);
                        const profileData = await getProfileByUserId(userData.id);
                        if (profileData) {
                            setProfile(profileData);
                            await updateStreak(profileData.id);
                        }
                    }
                } catch (err) {
                    console.error('Session load failed:', err);
                    localStorage.removeItem('nodefit_user_id');
                }
            }
            setIsLoading(false);
        };
        loadSession();
    }, []);

    const signup = async (email, password) => {
        const userId = await createUser(email, password);
        const userData = await getUser(userId);
        setUser(userData);
        localStorage.setItem('nodefit_user_id', userId.toString());
        return userData;
    };

    const signin = async (email, password) => {
        const userData = await authenticateUser(email, password);
        setUser(userData);
        localStorage.setItem('nodefit_user_id', userData.id.toString());

        const profileData = await getProfileByUserId(userData.id);
        if (profileData) {
            setProfile(profileData);
            await updateStreak(profileData.id);
        }
        return { user: userData, profile: profileData };
    };

    const setupProfile = async (profileData) => {
        if (!user) throw new Error('Not authenticated');
        const profileId = await createProfile(user.id, profileData);
        const newProfile = await getProfileByUserId(user.id);
        setProfile(newProfile);
        await updateStreak(profileId);
        return newProfile;
    };

    const refreshProfile = async () => {
        if (user) {
            const profileData = await getProfileByUserId(user.id);
            setProfile(profileData);
        }
    };

    const logout = () => {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('nodefit_user_id');
    };

    const value = {
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        hasProfile: !!profile,
        signup,
        signin,
        setupProfile,
        refreshProfile,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
