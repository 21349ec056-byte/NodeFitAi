import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputForm from '../components/InputForm';
import Dashboard from '../components/Dashboard';
import { generateHealthReport } from '../utils/geminiService';
import { saveReport, awardBadge, BADGE_TYPES } from '../lib/db';
import { ChevronLeft, Sparkles } from 'lucide-react';

export default function HealthScan() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState('form'); // 'form' | 'loading' | 'result'
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const handleFormSubmit = async (formData) => {
        setView('loading');
        setError('');

        try {
            // Merge profile data with form data
            const fullData = {
                ...formData,
                name: currentUser.name,
                gender: currentUser.gender,
                age: currentUser.age || formData.age,
                height: currentUser.height || formData.height,
                weight: currentUser.weight || formData.weight,
                goal: currentUser.goal || formData.goal,
            };

            const generatedReport = await generateHealthReport(fullData, apiKey);

            // Save to database
            await saveReport(currentUser.id, generatedReport);

            // Award first scan badge
            await awardBadge(currentUser.id, BADGE_TYPES.FIRST_SCAN);

            setReport(generatedReport);
            setView('result');
        } catch (err) {
            console.error('Scan failed:', err);
            setError(err.message || 'Failed to generate health report');
            setView('form');
        }
    };

    return (
        <div className="scan-page">
            <header className="scan-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <ChevronLeft size={20} /> Dashboard
                </button>
                <h1><Sparkles size={20} /> Health Scan</h1>
            </header>

            <main className="scan-main">
                {error && <div className="error-banner">{error}</div>}

                {view === 'form' && (
                    <InputForm onSubmit={handleFormSubmit} prefillData={currentUser} />
                )}

                {view === 'loading' && (
                    <div className="loading-screen">
                        <div className="loading-animation">
                            <div className="pulse-ring" />
                            <div className="pulse-ring delay-1" />
                            <Sparkles size={32} className="loading-icon" />
                        </div>
                        <h2>Analyzing Your Health Data</h2>
                        <p>Our AI is generating personalized insights...</p>
                    </div>
                )}

                {view === 'result' && report && (
                    <Dashboard report={report} userData={currentUser} />
                )}
            </main>
        </div>
    );
}
