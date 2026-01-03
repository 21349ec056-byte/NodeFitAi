import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    Flame, Heart, Footprints, Moon, Timer, Brain,
    Check, X, Cloud, Droplets, Wind, RefreshCw,
    Sparkles, Camera, AlertTriangle, Loader2
} from 'lucide-react';
import { getOrCreateStreak, getBadges, getMeals, getTasks, getLatestReport } from '../lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function Dashboard() {
    const { profile, user } = useAuth();
    const [streak, setStreak] = useState({ current: 0, longest: 0 });
    const [recentMeals, setRecentMeals] = useState([]);
    const [latestReport, setLatestReport] = useState(null);
    const [weather, setWeather] = useState(null);
    const [insights, setInsights] = useState(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    // Simulated health metrics (in real app, these would come from wearables)
    const [metrics] = useState({
        heartRate: { value: 72, unit: 'bpm', trend: -3, label: 'Resting average' },
        steps: { value: 8432, goal: 10000, unit: 'steps', trend: 12 },
        sleep: { value: 7.5, unit: 'hrs', trend: 8, deepSleep: 2.1 },
        activeMinutes: { value: 45, unit: 'min', trend: -5, label: 'Zone 2+ cardio' },
    });

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    useEffect(() => {
        const loadData = async () => {
            const storageId = profile?.id || (user?.id ? `temp_${user.id}` : null);
            if (storageId) {
                const [s, m, r] = await Promise.all([
                    profile?.id ? getOrCreateStreak(profile.id) : { current: 0, longest: 0 },
                    getMeals(storageId, 3),
                    profile?.id ? getLatestReport(profile.id) : null,
                ]);
                setStreak(s);
                setRecentMeals(m);
                setLatestReport(r);
            }
        };
        loadData();
        fetchWeather();
    }, [profile, user]);

    const fetchWeather = async () => {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
                    );
                    const data = await res.json();
                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        humidity: data.current.relative_humidity_2m,
                        wind: Math.round(data.current.wind_speed_10m),
                        code: data.current.weather_code,
                    });
                });
            }
        } catch (err) {
            console.error('Weather fetch failed:', err);
        }
    };

    const generateInsights = async () => {
        if (!profile) return;
        setIsLoadingInsights(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Generate personalized health insights for this user. Keep it concise.

User Profile:
- Goal: ${profile.goal || 'General Wellness'}
- Age: ${profile.age || 'Unknown'}
- Gender: ${profile.gender || 'Unknown'}

Current Metrics:
- Heart Rate: ${metrics.heartRate.value} bpm (${metrics.heartRate.trend > 0 ? '+' : ''}${metrics.heartRate.trend}% vs yesterday)
- Steps: ${metrics.steps.value} (${Math.round((metrics.steps.value / metrics.steps.goal) * 100)}% of goal)
- Sleep: ${metrics.sleep.value} hrs (${metrics.sleep.deepSleep} hrs deep sleep)
- Active Minutes: ${metrics.activeMinutes.value} min
${weather ? `- Weather: ${weather.temp}°C, ${weather.humidity}% humidity, ${weather.wind} km/h wind` : ''}

Return ONLY valid JSON:
{
  "insights": [
    {"type": "positive", "title": "Brief title", "description": "1-2 sentence insight"},
    {"type": "warning", "title": "Brief title", "description": "1-2 sentence insight"},
    {"type": "tip", "title": "Brief title", "description": "1-2 sentence insight"}
  ],
  "dos": ["Do recommendation 1", "Do recommendation 2", "Do recommendation 3"],
  "donts": ["Don't recommendation 1", "Don't recommendation 2", "Don't recommendation 3"],
  "weatherAdvice": "Brief weather-based health advice if weather data available, or null"
}`;

            const result = await model.generateContent(prompt);
            const text = (await result.response).text();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            setInsights(JSON.parse(cleaned));
        } catch (err) {
            console.error('Insight generation failed:', err);
        } finally {
            setIsLoadingInsights(false);
        }
    };

    const displayName = profile?.name || user?.email?.split('@')[0] || 'there';
    const stepsProgress = Math.round((metrics.steps.value / metrics.steps.goal) * 100);

    const getWeatherIcon = (code) => {
        if (code <= 3) return '☀️';
        if (code <= 49) return '☁️';
        if (code <= 69) return '🌧️';
        if (code <= 79) return '❄️';
        return '⛈️';
    };

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

            {/* Health Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon heart">
                        <Heart size={20} />
                    </div>
                    <div className="metric-trend negative">{metrics.heartRate.trend}%</div>
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
                    <div className="metric-trend positive">+{metrics.steps.trend}%</div>
                    <div className="metric-label">Steps</div>
                    <div className="metric-value">
                        <span className="value">{metrics.steps.value.toLocaleString()}</span>
                        <span className="unit">{metrics.steps.unit}</span>
                    </div>
                    <div className="metric-sub">{stepsProgress}% of daily goal</div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon sleep">
                        <Moon size={20} />
                    </div>
                    <div className="metric-trend positive">+{metrics.sleep.trend}%</div>
                    <div className="metric-label">Sleep</div>
                    <div className="metric-value">
                        <span className="value">{metrics.sleep.value}</span>
                        <span className="unit">{metrics.sleep.unit}</span>
                    </div>
                    <div className="metric-sub">Deep sleep: {metrics.sleep.deepSleep} hrs</div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon active">
                        <Timer size={20} />
                    </div>
                    <div className="metric-trend negative">{metrics.activeMinutes.trend}%</div>
                    <div className="metric-label">Active Minutes</div>
                    <div className="metric-value">
                        <span className="value">{metrics.activeMinutes.value}</span>
                        <span className="unit">{metrics.activeMinutes.unit}</span>
                    </div>
                    <div className="metric-sub">{metrics.activeMinutes.label}</div>
                </div>
            </div>

            {/* Weather Card */}
            {weather && (
                <div className="weather-card">
                    <div className="weather-main">
                        <span className="weather-icon">{getWeatherIcon(weather.code)}</span>
                        <span className="weather-temp">{weather.temp}°C</span>
                    </div>
                    <div className="weather-details">
                        <span><Droplets size={14} /> {weather.humidity}%</span>
                        <span><Wind size={14} /> {weather.wind} km/h</span>
                    </div>
                    {insights?.weatherAdvice && (
                        <p className="weather-advice">{insights.weatherAdvice}</p>
                    )}
                </div>
            )}

            {/* AI Insights Section */}
            <div className="insights-section">
                <div className="section-header">
                    <h2><Brain size={18} /> AI Insights</h2>
                    <button
                        className="refresh-btn"
                        onClick={generateInsights}
                        disabled={isLoadingInsights}
                    >
                        {isLoadingInsights ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                    </button>
                </div>

                {insights ? (
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
                        <p>Click refresh to generate AI insights</p>
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
                                    <li><Check size={14} /> Practice deep breathing before bed</li>
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
                                    <li><X size={14} /> Avoid high-intensity evening workouts</li>
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
                    <Link to="/app/tasks" className="quick-action-btn">
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
