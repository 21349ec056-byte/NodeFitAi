import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, X, Loader2, Utensils, Check, AlertTriangle, Upload } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logMeal, awardBadge, BADGE_TYPES, getMeals } from '../lib/db';

export default function FoodCamera() {
    const { profile, user } = useAuth();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const [mode, setMode] = useState('select');
    const [capturedImage, setCapturedImage] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');
    const [stream, setStream] = useState(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            setMode('camera');
        } catch (err) {
            setError('Camera access denied. Please upload an image instead.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        setMode('preview');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setCapturedImage(event.target.result);
            setMode('preview');
        };
        reader.onerror = () => setError('Failed to read image file');
        reader.readAsDataURL(file);
    };

    const analyzeFood = async () => {
        setMode('analyzing');
        setError('');

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const base64Data = capturedImage.split(',')[1];
            const mimeType = capturedImage.split(';')[0].split(':')[1] || 'image/jpeg';

            const userAllergies = profile?.allergies || '';

            const prompt = `Analyze this food image and return ONLY valid JSON.
${userAllergies ? `IMPORTANT: The user is ALLERGIC to: ${userAllergies}. Check if ANY ingredients might contain these allergens!` : ''}

{
  "foodName": "Name of the dish",
  "ingredients": ["ingredient1", "ingredient2"],
  "estimatedCalories": 350,
  "nutritionScore": "Good/Fair/Poor",
  "healthAnalysis": "Brief analysis",
  "allergyWarning": {
    "hasAllergen": ${userAllergies ? 'true/false based on ingredients' : 'false'},
    "allergens": ["list of detected allergens that user is allergic to"],
    "severity": "High/Medium/Low",
    "message": "Warning message if allergens detected"
  },
  "goalAlignment": {
    "goal": "${profile?.goal || 'General Wellness'}",
    "isAligned": true,
    "reason": "Why it helps or hurts your goal"
  },
  "recommendations": ["Tip 1", "Tip 2"]
}`;

            const result = await model.generateContent([
                prompt,
                { inlineData: { mimeType, data: base64Data } },
            ]);

            const text = (await result.response).text();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            // Save meal - use profile.id if available, otherwise use user.id as temp profile
            const storageId = profile?.id || (user?.id ? `temp_${user.id}` : null);
            if (storageId) {
                try {
                    await logMeal(storageId, {
                        photoBlob: capturedImage,
                        ingredients: parsed.ingredients,
                        calories: parsed.estimatedCalories,
                        analysis: parsed,
                    });
                    console.log('Meal saved with ID:', storageId);

                    const meals = await getMeals(storageId, 10);
                    if (meals.length >= 10 && profile?.id) {
                        await awardBadge(profile.id, BADGE_TYPES.FOOD_LOGGER);
                    }
                } catch (saveErr) {
                    console.error('Failed to save meal:', saveErr);
                }
            }

            setAnalysis(parsed);
            setMode('result');
        } catch (err) {
            console.error('Analysis failed:', err);
            setError('Failed to analyze food. Please try again.');
            setMode('preview');
        }
    };

    const reset = () => {
        setCapturedImage(null);
        setAnalysis(null);
        setError('');
        stopCamera();
        setMode('select');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className="food-page fade-in">
            <h1><Camera size={24} /> Food Scanner</h1>

            {error && <div className="error-banner">{error}</div>}

            {mode === 'select' && (
                <div className="source-selection">
                    <p className="text-muted">Choose how to add your food</p>
                    <div className="source-options">
                        <button className="source-btn" onClick={startCamera}>
                            <Camera size={32} />
                            <span>Take Photo</span>
                        </button>
                        <button className="source-btn" onClick={() => fileInputRef.current?.click()}>
                            <Upload size={32} />
                            <span>Upload Image</span>
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            {mode === 'camera' && (
                <div className="camera-container">
                    <video ref={videoRef} autoPlay playsInline className="camera-feed" />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="camera-controls">
                        <button className="btn-secondary" onClick={reset}>Cancel</button>
                        <button className="capture-btn" onClick={capturePhoto}>
                            <Camera size={24} />
                        </button>
                    </div>
                </div>
            )}

            {mode === 'preview' && (
                <div className="preview-container">
                    <img src={capturedImage} alt="Food" className="preview-image" />
                    <div className="preview-actions">
                        <button className="btn-secondary" onClick={reset}>Retake</button>
                        <button className="btn-primary" onClick={analyzeFood}>
                            Analyze <Utensils size={18} />
                        </button>
                    </div>
                </div>
            )}

            {mode === 'analyzing' && (
                <div className="analyzing-container">
                    <Loader2 size={48} className="spin" />
                    <h2>Analyzing...</h2>
                    <p className="text-muted">Identifying ingredients and nutrition</p>
                </div>
            )}

            {mode === 'result' && analysis && (
                <div className="result-container">
                    <div className="result-header">
                        <img src={capturedImage} alt="Food" className="result-thumb" />
                        <div>
                            <h2>{analysis.foodName}</h2>
                            <span className={`score-badge ${analysis.nutritionScore.toLowerCase()}`}>
                                {analysis.nutritionScore}
                            </span>
                        </div>
                    </div>

                    <div className="result-stats">
                        <div className="stat">
                            <span className="stat-value">{analysis.estimatedCalories}</span>
                            <span className="stat-label">Calories</span>
                        </div>
                    </div>

                    <div className="result-section">
                        <h3>Ingredients</h3>
                        <div className="tags">
                            {analysis.ingredients.map((ing, i) => (
                                <span key={i} className="tag">{ing}</span>
                            ))}
                        </div>
                    </div>

                    <div className="result-section">
                        <h3>Health Analysis</h3>
                        <p>{analysis.healthAnalysis}</p>
                    </div>

                    {/* Allergy Warning */}
                    {analysis.allergyWarning?.hasAllergen && (
                        <div className="allergy-warning">
                            <div className="allergy-header">
                                <AlertTriangle size={24} />
                                <span>⚠️ ALLERGY ALERT!</span>
                            </div>
                            <p className="allergy-message">{analysis.allergyWarning.message}</p>
                            <div className="allergy-tags">
                                {analysis.allergyWarning.allergens?.map((allergen, i) => (
                                    <span key={i} className="allergen-tag">{allergen}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={`goal-card ${analysis.goalAlignment.isAligned ? 'success' : 'warning'}`}>
                        <div className="goal-status">
                            {analysis.goalAlignment.isAligned ? <Check size={20} /> : <AlertTriangle size={20} />}
                            <span>{analysis.goalAlignment.isAligned ? 'Good for your goal' : 'Consider alternatives'}</span>
                        </div>
                        <p>{analysis.goalAlignment.reason}</p>
                    </div>

                    <div className="result-section">
                        <h3>Recommendations</h3>
                        <ul>
                            {analysis.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    </div>

                    <button className="btn-primary btn-full" onClick={reset}>
                        Scan Another Food
                    </button>
                </div>
            )}
        </div>
    );
}
