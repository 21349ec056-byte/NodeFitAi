import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    Flame, Heart, Footprints, Moon, Timer, Brain,
    Check, X, Droplets, Wind, RefreshCw,
    Sparkles, Camera, AlertTriangle, Loader2, Shield, Zap
} from 'lucide-react';
import { getOrCreateStreak, getMeals, getLatestReport } from '../lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function Dashboard() {
    const { profile, user } = useAuth();
    const [streak, setStreak] = useState({ current: 0, longest: 0 });
    const [recentMeals, setRecentMeals] = useState([]);
    const [weather, setWeather] = useState(null);
    const [aqi, setAqi] = useState(null);
    const [aiSummary, setAiSummary] = useState(null);
    const [insights, setInsights] = useState(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    // Use profile data for metrics, with defaults
    const metrics = {
        heartRate: {
            value: profile?.avgHeartRate || 72,
            unit: 'bpm',
            trend: -3,
            label: 'Resting average'
        },
        steps: {
            value: profile?.avgSteps || 5000,
            goal: 10000,
            unit: 'steps',
            trend: 12
        },
        sleep: {
            value: profile?.sleepHours || 7,
            unit: 'hrs',
            trend: 8,
            quality: profile?.sleepQuality || 'Good'
        },
        water: {
            value: profile?.waterIntake || 4,
            goal: 8,
            unit: 'glasses'
        },
    };

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    useEffect(() => {
        const loadData = async () => {
            const storageId = profile?.id || (user?.id ? `temp_${user.id}` : null);
            if (storageId) {
                const [s, m] = await Promise.all([
                    profile?.id ? getOrCreateStreak(profile.id) : { current: 0, longest: 0 },
                    getMeals(storageId, 3),
                ]);
                setStreak(s);
                setRecentMeals(m);
            }
        };
        loadData();
        fetchWeatherAndAQI();
    }, [profile, user]);

    const fetchWeatherAndAQI = async () => {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;

                    // Fetch weather
                    const weatherRes = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index`
                    );
                    const weatherData = await weatherRes.json();
                    setWeather({
                        temp: Math.round(weatherData.current.temperature_2m),
                        humidity: weatherData.current.relative_humidity_2m,
                        wind: Math.round(weatherData.current.wind_speed_10m),
                        uv: weatherData.current.uv_index,
                        code: weatherData.current.weather_code,
                    });

                    // Fetch AQI
                    const aqiRes = await fetch(
                        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm2_5,pm10`
                    );
                    const aqiData = await aqiRes.json();
                    setAqi({
                        value: aqiData.current.european_aqi,
                        pm25: aqiData.current.pm2_5,
                        pm10: aqiData.current.pm10,
                    });
                });
            }
        } catch (err) {
            console.error('Weather/AQI fetch failed:', err);
        }
    };

    const getAQILevel = (value) => {
        if (value <= 20) return { label: 'Good', color: 'success', advice: 'Air quality is excellent. Great for outdoor activities!' };
        if (value <= 40) return { label: 'Fair', color: 'success', advice: 'Air quality is acceptable. Enjoy outdoor activities.' };
        if (value <= 60) return { label: 'Moderate', color: 'warning', advice: 'Sensitive groups should limit prolonged outdoor exertion.' };
        if (value <= 80) return { label: 'Poor', color: 'warning', advice: 'Consider wearing a mask outdoors. Limit strenuous activities.' };
        if (value <= 100) return { label: 'Very Poor', color: 'error', advice: '⚠️ Wear a mask outdoors! Avoid outdoor exercise.' };
        return { label: 'Hazardous', color: 'error', advice: '🚨 Stay indoors! Use air purifiers. Wear N95 mask if going out.' };
    };

    const generateAISummary = async () => {
        setIsLoadingInsights(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const aqiInfo = aqi ? getAQILevel(aqi.value) : null;

            const prompt = `Generate a personalized health summary and recommendations. Be concise and actionable.

USER PROFILE:
- Name: ${profile?.name || 'User'}
- Goal: ${profile?.goal || 'General Wellness'}
- Age: ${profile?.age || 'Unknown'}, Gender: ${profile?.gender || 'Unknown'}
- Height: ${profile?.height || 'Unknown'}cm, Weight: ${profile?.weight || 'Unknown'}kg
- Target Weight: ${profile?.targetWeight || 'Not set'}kg
- Diet: ${profile?.dietType || 'Not specified'}
- Activity Level: ${profile?.activityLevel || 'Unknown'}
- Exercise: ${profile?.exerciseFrequency || '0'} days/week
- Sleep: ${profile?.sleepHours || '7'} hrs, Quality: ${profile?.sleepQuality || 'Unknown'}
- Screen Time: ${profile?.screenTime || '4'} hrs/day
- Water Intake: ${profile?.waterIntake || '4'} glasses/day
- Caffeine: ${profile?.caffeineIntake || '0'} cups/day

HABITS (IMPORTANT - tailor advice based on these):
- Alcohol: ${profile?.alcoholFrequency || 'Unknown'}
- Smoking: ${profile?.smokingStatus || 'Unknown'}
- Substance Use: ${profile?.substanceUse || 'Unknown'}

ACCESSIBILITY & CONSTRAINTS (VERY IMPORTANT - adapt recommendations accordingly):
- Has Physical Disability: ${profile?.hasDisability ? 'Yes - ' + (profile.disabilityDetails || 'Not specified') : 'No'}
- Job Requires Screen Time: ${profile?.hasJobConstraints ? 'Yes (IT/Developer/Office work)' : 'No'}
- Has Chronic Condition: ${profile?.hasChronicCondition ? 'Yes - ' + (profile.chronicConditionDetails || 'Not specified') : 'No'}
${profile?.hasDisability || profile?.hasChronicCondition ? '⚠️ Please provide accessible alternatives for physical activities!' : ''}
${profile?.hasJobConstraints ? '⚠️ Do not suggest reducing screen time, instead suggest breaks and eye care!' : ''}

HEALTH INFO:
- Has Wearable: ${profile?.hasWearable ? 'Yes - ' + profile.wearableType : 'No'}
- Medical Conditions: ${profile?.medicalConditions || 'None specified'}
- Allergies: ${profile?.allergies || 'None'}

CURRENT DATA:
- Steps: ${metrics.steps.value} (goal: ${metrics.steps.goal})
- Heart Rate: ${metrics.heartRate.value} bpm
- Sleep: ${metrics.sleep.value} hrs
- Water: ${metrics.water.value}/${metrics.water.goal} glasses
${weather ? `- Weather: ${weather.temp}°C, ${weather.humidity}% humidity, UV: ${weather.uv}` : ''}
${aqi ? `- Air Quality: ${aqiInfo.label} (AQI ${aqi.value}), PM2.5: ${aqi.pm25}` : ''}

Return ONLY valid JSON:
{
  "summary": "A 2-3 sentence personalized health summary for today",
  "healthScore": 75,
  "insights": [
    {"type": "positive", "title": "Title", "description": "1 sentence"},
    {"type": "warning", "title": "Title", "description": "1 sentence"},
    {"type": "tip", "title": "Title", "description": "1 sentence"}
  ],
  "dos": ["Action 1", "Action 2", "Action 3"],
  "donts": ["Avoid 1", "Avoid 2", "Avoid 3"],
  "weatherAdvice": "Brief advice based on current weather/AQI",
  "priorityAction": "The single most important thing to do today"
}`;

            const result = await model.generateContent(prompt);
            const text = (await result.response).text();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            setAiSummary(parsed.summary);
            setInsights(parsed);
        } catch (err) {
            console.error('AI summary failed:', err);
        } finally {
            setIsLoadingInsights(false);
        }
    };

    // Auto-generate on mount if profile exists
    useEffect(() => {
        if (profile && weather && !aiSummary) {
            setTimeout(generateAISummary, 500);
        }
    }, [profile, weather]);

    const displayName = profile?.name || user?.email?.split('@')[0] || 'there';
    const stepsProgress = Math.round((metrics.steps.value / metrics.steps.goal) * 100);
    const waterProgress = Math.round((metrics.water.value / metrics.water.goal) * 100);

    // Share badge on social media
    const shareBadge = (badge) => {
        const text = `🏆 I just earned the "${badge.name}" badge on nodeFit AI! ${badge.icon}\n\n${badge.desc}\n\nTrack your health journey too! #nodeFitAI #HealthGoals`;

        if (navigator.share) {
            navigator.share({
                title: `nodeFit AI - ${badge.name} Badge`,
                text: text,
            }).catch(console.error);
        } else {
            // Fallback: Copy to clipboard and open Twitter
            navigator.clipboard.writeText(text);
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    // Export health report
    const exportReport = () => {
        const report = `
╔══════════════════════════════════════════════════════════╗
║                    nodeFit AI Health Report              ║
╚══════════════════════════════════════════════════════════╝

📅 Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
👤 User: ${displayName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 HEALTH METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❤️  Heart Rate:     ${metrics.heartRate.value} ${metrics.heartRate.unit}
🚶  Steps:          ${metrics.steps.value.toLocaleString()} / ${metrics.steps.goal} (${stepsProgress}%)
😴  Sleep:          ${metrics.sleep.value} ${metrics.sleep.unit} (${metrics.sleep.quality})
💧  Water:          ${metrics.water.value} / ${metrics.water.goal} glasses (${waterProgress}%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 USER PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal:           ${profile?.goal || 'Not set'}
Age:            ${profile?.age || 'Not specified'}
Gender:         ${profile?.gender || 'Not specified'}
Height:         ${profile?.height || 'Not specified'} cm
Weight:         ${profile?.weight || 'Not specified'} kg
Activity Level: ${profile?.activityLevel || 'Not specified'}
Diet Type:      ${profile?.dietType || 'Not specified'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 STREAK & ACHIEVEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Streak: ${streak.current} days
Longest Streak: ${streak.longest} days
Meals Logged:   ${recentMeals.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 AI HEALTH SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${aiSummary || 'No AI summary generated yet.'}

Health Score: ${insights?.healthScore || 'N/A'}/100

✅ DO'S:
${insights?.dos?.map(d => `   • ${d}`).join('\n') || '   • Not available'}

❌ DON'TS:
${insights?.donts?.map(d => `   • ${d}`).join('\n') || '   • Not available'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌤️ ENVIRONMENTAL CONDITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${weather ? `Temperature: ${weather.temp}°C
Humidity: ${weather.humidity}%
Wind: ${weather.wind} km/h
UV Index: ${weather.uv}` : 'Weather data not available'}

${aqi ? `Air Quality Index: ${aqi.value}
PM2.5: ${aqi.pm25}
PM10: ${aqi.pm10}` : 'AQI data not available'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    Generated by nodeFit AI
              Your Privacy-First Health Intelligence
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;

        // Create and download the file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nodeFit-Health-Report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getWeatherIcon = (code) => {
        if (code <= 3) return '☀️';
        if (code <= 49) return '☁️';
        if (code <= 69) return '🌧️';
        if (code <= 79) return '❄️';
        return '⛈️';
    };

    const aqiInfo = aqi ? getAQILevel(aqi.value) : null;

    return (
        <div className="dashboard-page fade-in">
            {/* Header */}
            <div className="dashboard-header-section">
                <div>
                    <h1>Welcome, {displayName}!</h1>
                    <p className="text-muted">Your personal health intelligence</p>
                </div>
                <div className="header-badges">
                    <div className="streak-badge">
                        <Flame size={18} />
                        <span className="streak-count">{streak.current}</span>
                        <span className="streak-label">day streak</span>
                    </div>
                </div>
            </div>

            {/* Medication Reminders */}
            {profile?.medications?.length > 0 && (
                <div className="medication-reminder-card">
                    <div className="reminder-header">
                        <span>💊 Today's Medications</span>
                    </div>
                    <div className="reminder-list">
                        {profile.medications.map((med, i) => {
                            const now = new Date();
                            const [hours, mins] = (med.time || '08:00').split(':').map(Number);
                            const medTime = new Date();
                            medTime.setHours(hours, mins, 0);
                            const isPast = now > medTime;
                            const isUpcoming = !isPast && (medTime - now) < 3600000; // within 1 hour

                            return (
                                <div key={i} className={`reminder-item ${isPast ? 'past' : ''} ${isUpcoming ? 'upcoming' : ''}`}>
                                    <span className="reminder-time">{med.time}</span>
                                    <span className="reminder-name">{med.name}</span>
                                    {isPast && <span className="reminder-status taken">✓</span>}
                                    {isUpcoming && <span className="reminder-status soon">Soon!</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* AI Summary Card */}
            {aiSummary && (
                <div className="summary-card">
                    <div className="summary-header">
                        <Sparkles size={18} />
                        <span>Today's Health Summary</span>
                        {insights?.healthScore && (
                            <div className="health-score">
                                <span className="score-value">{insights.healthScore}</span>
                                <span className="score-label">/100</span>
                            </div>
                        )}
                    </div>
                    <p className="summary-text">{aiSummary}</p>
                    {insights?.priorityAction && (
                        <div className="priority-action">
                            <Zap size={16} />
                            <span><strong>Priority:</strong> {insights.priorityAction}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Weather & AQI Card */}
            {(weather || aqi) && (
                <div className="weather-aqi-card">
                    {weather && (
                        <div className="weather-section">
                            <span className="weather-icon">{getWeatherIcon(weather.code)}</span>
                            <div className="weather-info">
                                <span className="weather-temp">{weather.temp}°C</span>
                                <div className="weather-details">
                                    <span><Droplets size={12} /> {weather.humidity}%</span>
                                    <span><Wind size={12} /> {weather.wind} km/h</span>
                                    {weather.uv > 0 && <span>UV: {weather.uv}</span>}
                                </div>
                            </div>
                        </div>
                    )}
                    {aqi && aqiInfo && (
                        <div className={`aqi-section ${aqiInfo.color}`}>
                            <div className="aqi-header">
                                <Shield size={18} />
                                <span className="aqi-label">Air Quality</span>
                                <span className={`aqi-badge ${aqiInfo.color}`}>{aqiInfo.label}</span>
                            </div>
                            <p className="aqi-advice">{aqiInfo.advice}</p>
                            <div className="aqi-details">
                                <span>AQI: {aqi.value}</span>
                                <span>PM2.5: {aqi.pm25}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Protection Tips Card */}
            {(weather || aqi) && (
                <div className="protection-tips-card">
                    <h3>🛡️ Today's Protection</h3>
                    <div className="protection-grid">
                        {/* Sunscreen */}
                        {weather?.uv >= 3 && (
                            <div className="protection-item sunscreen">
                                <span className="protection-icon">🧴</span>
                                <div className="protection-info">
                                    <span className="protection-label">Sunscreen</span>
                                    <span className="protection-status recommended">Recommended</span>
                                    <span className="protection-reason">
                                        UV Index: {weather.uv} - {weather.uv >= 8 ? 'Very High! SPF 50+ required' : weather.uv >= 6 ? 'High! Use SPF 30+' : 'Moderate, SPF 15+'}
                                    </span>
                                </div>
                            </div>
                        )}
                        {weather?.uv < 3 && weather && (
                            <div className="protection-item sunscreen optional">
                                <span className="protection-icon">🧴</span>
                                <div className="protection-info">
                                    <span className="protection-label">Sunscreen</span>
                                    <span className="protection-status optional">Optional</span>
                                    <span className="protection-reason">UV Index is low ({weather.uv})</span>
                                </div>
                            </div>
                        )}

                        {/* Mask */}
                        {aqi?.value >= 50 && (
                            <div className="protection-item mask">
                                <span className="protection-icon">😷</span>
                                <div className="protection-info">
                                    <span className="protection-label">Face Mask</span>
                                    <span className={`protection-status ${aqi.value >= 100 ? 'required' : 'recommended'}`}>
                                        {aqi.value >= 100 ? 'Required' : 'Recommended'}
                                    </span>
                                    <span className="protection-reason">
                                        {aqi.value >= 150 ? 'Air quality is unhealthy - N95 mask advised' :
                                            aqi.value >= 100 ? 'Moderate pollution - Use mask outdoors' :
                                                'Light pollution - Mask recommended for sensitive individuals'}
                                    </span>
                                </div>
                            </div>
                        )}
                        {aqi?.value < 50 && aqi && (
                            <div className="protection-item mask optional">
                                <span className="protection-icon">😷</span>
                                <div className="protection-info">
                                    <span className="protection-label">Face Mask</span>
                                    <span className="protection-status good">Not Needed</span>
                                    <span className="protection-reason">Air quality is good today</span>
                                </div>
                            </div>
                        )}

                        {/* Hydration based on heat */}
                        {weather?.temp >= 30 && (
                            <div className="protection-item hydration">
                                <span className="protection-icon">💧</span>
                                <div className="protection-info">
                                    <span className="protection-label">Extra Hydration</span>
                                    <span className="protection-status required">Required</span>
                                    <span className="protection-reason">High temperature ({weather.temp}°C) - Drink extra water</span>
                                </div>
                            </div>
                        )}

                        {/* Umbrella/Rain gear */}
                        {weather?.code >= 50 && weather?.code <= 99 && (
                            <div className="protection-item rain">
                                <span className="protection-icon">☔</span>
                                <div className="protection-info">
                                    <span className="protection-label">Rain Protection</span>
                                    <span className="protection-status recommended">Carry Umbrella</span>
                                    <span className="protection-reason">Rain expected today</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Health Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon heart">
                        <Heart size={20} />
                    </div>
                    <div className="metric-label">Heart Rate</div>
                    <div className="metric-value">
                        <span className="value">{metrics.heartRate.value}</span>
                        <span className="unit">{metrics.heartRate.unit}</span>
                    </div>
                    <div className="metric-sub">{metrics.heartRate.label}</div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon steps">
                        <Footprints size={20} />
                    </div>
                    <div className="metric-label">Steps</div>
                    <div className="metric-value">
                        <span className="value">{metrics.steps.value.toLocaleString()}</span>
                    </div>
                    <div className="metric-progress">
                        <div className="mini-progress">
                            <div className="mini-progress-fill" style={{ width: `${Math.min(stepsProgress, 100)}%` }} />
                        </div>
                        <span>{stepsProgress}%</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon sleep">
                        <Moon size={20} />
                    </div>
                    <div className="metric-label">Sleep</div>
                    <div className="metric-value">
                        <span className="value">{metrics.sleep.value}</span>
                        <span className="unit">{metrics.sleep.unit}</span>
                    </div>
                    <div className="metric-sub">{metrics.sleep.quality}</div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon water">
                        <Droplets size={20} />
                    </div>
                    <div className="metric-label">Water</div>
                    <div className="metric-value">
                        <span className="value">{metrics.water.value}</span>
                        <span className="unit">/{metrics.water.goal}</span>
                    </div>
                    <div className="metric-progress">
                        <div className="mini-progress">
                            <div className="mini-progress-fill" style={{ width: `${Math.min(waterProgress, 100)}%` }} />
                        </div>
                        <span>{waterProgress}%</span>
                    </div>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="insights-section">
                <div className="section-header">
                    <h2><Brain size={18} /> AI Insights</h2>
                    <button
                        className="refresh-btn"
                        onClick={generateAISummary}
                        disabled={isLoadingInsights}
                    >
                        {isLoadingInsights ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                    </button>
                </div>

                {insights?.insights ? (
                    <div className="insights-list">
                        {insights.insights.map((insight, i) => (
                            <div key={i} className={`insight-card ${insight.type}`}>
                                <div className="insight-icon">
                                    {insight.type === 'positive' && <Check size={16} />}
                                    {insight.type === 'warning' && <AlertTriangle size={16} />}
                                    {insight.type === 'tip' && <Sparkles size={16} />}
                                </div>
                                <div className="insight-content">
                                    <h4>{insight.title}</h4>
                                    <p>{insight.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="insights-empty">
                        <Sparkles size={24} />
                        <p>{isLoadingInsights ? 'Generating insights...' : 'Click refresh to generate AI insights'}</p>
                    </div>
                )}
            </div>

            {/* Guidelines Section */}
            <div className="guidelines-section">
                <h2>Personalized Guidelines</h2>
                <div className="guidelines-grid">
                    <div className="guideline-column dos">
                        <h3><Check size={16} /> Do's</h3>
                        <ul>
                            {insights?.dos ? insights.dos.map((item, i) => (
                                <li key={i}><Check size={14} /> {item}</li>
                            )) : (
                                <>
                                    <li><Check size={14} /> Take a 20-minute walk after dinner</li>
                                    <li><Check size={14} /> Maintain consistent sleep schedule</li>
                                    <li><Check size={14} /> Include protein in breakfast</li>
                                </>
                            )}
                        </ul>
                    </div>
                    <div className="guideline-column donts">
                        <h3><X size={16} /> Don'ts</h3>
                        <ul>
                            {insights?.donts ? insights.donts.map((item, i) => (
                                <li key={i}><X size={14} /> {item}</li>
                            )) : (
                                <>
                                    <li><X size={14} /> Avoid caffeine after 2 PM</li>
                                    <li><X size={14} /> Don't skip morning routine</li>
                                    <li><X size={14} /> Limit screen time before bed</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="actions-row">
                    <Link to="/app/food" className="quick-action-btn">
                        <Camera size={20} />
                        <span>Scan Food</span>
                    </Link>
                    <Link to="/app/tasks" className="quick-action-btn secondary">
                        <Check size={20} />
                        <span>View Tasks</span>
                    </Link>
                </div>
            </div>

            {/* Recent Meals */}
            {recentMeals.length > 0 && (
                <div className="recent-section">
                    <div className="section-header">
                        <h2>Recent Meals</h2>
                        <Link to="/app/history" className="link-btn">View all</Link>
                    </div>
                    <div className="meals-row">
                        {recentMeals.map(meal => (
                            <div key={meal.id} className="mini-meal-card">
                                {meal.photoBlob && <img src={meal.photoBlob} alt="" />}
                                <div className="mini-meal-info">
                                    <span className="name">{meal.analysis?.foodName || 'Food'}</span>
                                    <span className="cal">{meal.calories || 0} kcal</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Food Suggestions */}
            <div className="suggestions-section">
                <div className="section-header">
                    <h2>🍽️ Today's Food Suggestions</h2>
                </div>
                <div className="suggestions-grid">
                    {(insights?.foodSuggestions || [
                        { meal: 'Breakfast', suggestion: 'Oatmeal with berries and nuts', calories: '350 kcal', icon: '🥣' },
                        { meal: 'Lunch', suggestion: 'Grilled chicken salad', calories: '450 kcal', icon: '🥗' },
                        { meal: 'Dinner', suggestion: 'Salmon with vegetables', calories: '500 kcal', icon: '🐟' },
                        { meal: 'Snack', suggestion: 'Greek yogurt with honey', calories: '150 kcal', icon: '🍯' },
                    ]).map((item, i) => (
                        <div key={i} className="suggestion-card">
                            <span className="suggestion-icon">{item.icon}</span>
                            <div className="suggestion-info">
                                <span className="suggestion-meal">{item.meal}</span>
                                <span className="suggestion-food">{item.suggestion}</span>
                                <span className="suggestion-cal">{item.calories}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Week Planner */}
            <div className="planner-section">
                <div className="section-header">
                    <h2>📅 This Week's Plan</h2>
                </div>
                <div className="planner-grid">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ...6=Sat
                        // Convert JS day to Mon=0, Tue=1, ...Sun=6
                        const todayIndex = jsDay === 0 ? 6 : jsDay - 1;
                        const isToday = i === todayIndex;
                        const isPast = i < todayIndex;
                        return (
                            <div key={day} className={`planner-day ${isToday ? 'today' : ''} ${isPast ? 'completed' : ''}`}>
                                <span className="day-name">{day}</span>
                                <div className="day-tasks">
                                    {isToday && <span className="day-badge">Today</span>}
                                    {isPast && <Check size={14} className="completed-icon" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Badges & Achievements */}
            <div className="badges-section">
                <div className="section-header">
                    <h2>🏆 Your Achievements</h2>
                </div>
                <div className="badges-grid">
                    {[
                        { name: 'Early Bird', icon: '🌅', unlocked: streak.current >= 3, desc: '3-day streak' },
                        { name: 'Week Warrior', icon: '⚔️', unlocked: streak.current >= 7, desc: '7-day streak' },
                        { name: 'Food Logger', icon: '📸', unlocked: recentMeals.length >= 5, desc: 'Log 5 meals' },
                        { name: 'Hydration Hero', icon: '💧', unlocked: metrics.water.value >= 8, desc: 'Drink 8 glasses' },
                    ].map((badge, i) => (
                        <div key={i} className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                            <span className="badge-icon">{badge.icon}</span>
                            <span className="badge-name">{badge.name}</span>
                            <span className="badge-desc">{badge.desc}</span>
                            {badge.unlocked && (
                                <button
                                    className="share-badge-btn"
                                    onClick={() => shareBadge(badge)}
                                    title="Share on social media"
                                >
                                    📤
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Export Report */}
            <div className="export-section">
                <div className="section-header">
                    <h2>📊 Health Report</h2>
                </div>
                <div className="export-card">
                    <p>Download your personalized health report with insights, metrics, and recommendations.</p>
                    <button className="btn-primary" onClick={exportReport}>
                        📥 Export Report (PDF)
                    </button>
                </div>
            </div>

            {/* Complete Profile Prompt */}
            {!profile && (
                <div className="prompt-card">
                    <Sparkles size={24} />
                    <div>
                        <h3>Complete your profile</h3>
                        <p>Get personalized health insights and recommendations</p>
                    </div>
                    <Link to="/onboarding" className="btn-primary btn-sm">Complete Now</Link>
                </div>
            )}
        </div>
    );
}
