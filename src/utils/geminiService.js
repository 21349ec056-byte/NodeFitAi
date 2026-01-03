import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `
You are nodeFit AI, an advanced privacy-first health intelligence engine acting as a responsible digital health companion.
Your task is to analyze user lifestyle, medical background, wearable data, and environmental context to generate personalized, preventive, and easy-to-understand health insights.
You must avoid medical diagnosis. Use clear, human-friendly language.

OUTPUT FORMAT:
Return ONLY a valid JSON object with the following structure. Do not include markdown code blocks around the JSON.
{
  "healthSnapshot": {
    "summary": "Short summary of health state...",
    "status": "Good/Fair/Needs Attention"
  },
  "metrics": [
    { "label": "BMI", "value": "24.5", "status": "Normal", "description": "Within healthy range." },
    { "label": "Sleep Efficiency", "value": "85%", "status": "Good", "description": "Consistent sleep schedule." }
  ],
  "recommendations": [
    { "title": "Increase Zone 2 Cardio", "reason": "Low resting heart rate but low calorie burn.", "impact": "High" },
    { "title": "Reduce Evening Screen Time", "reason": "Screen time is 5h+, impacting sleep.", "impact": "Medium" }
  ],
  "lifestyleOptimization": {
    "sleep": "Tips for sleep...",
    "screenTime": "Tips for screen time...",
    "stress": "Tips for stress..."
  },
  "nutrition": {
    "suggestions": ["Oatmeal", "Lean Chicken", "Spinach"],
    "hydration": "Drink 3L water..."
  },
  "dosAndDonts": {
    "dos": ["Walk 10k steps", "Drink water"],
    "donts": ["Eat late night", "Smoke"]
  },
  "environmental": {
    "suggestion": "AQI is moderate, wear a mask if running outdoors.",
    "alertLevel": "Low/Medium/High"
  },
  "weeklyPlan": [
    { "day": "Monday", "focus": "Cardio + Lower Body" },
    { "day": "Tuesday", "focus": "Rest / Stretching" },
    { "day": "Wednesday", "focus": "Upper Body Strength" },
    { "day": "Thursday", "focus": "Active Recovery" },
    { "day": "Friday", "focus": "HIIT Session" },
    { "day": "Saturday", "focus": "Outdoor Activity" },
    { "day": "Sunday", "focus": "Rest & Meal Prep" }
  ],
  "dashboardSummary": [
    "Keep up the walking routine.",
    "Watch sugar intake."
  ]
}
`;

export async function testApiKey(apiKey) {
  if (!apiKey) return false;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Say 'OK' if you can hear me.");
    const response = await result.response;
    return response.text().toLowerCase().includes('ok');
  } catch (error) {
    console.error("API Key test failed:", error);
    return false;
  }
}

export async function generateHealthReport(userData, apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      ANALYZE THIS USER DATA AND GENERATE A COMPREHENSIVE HEALTH REPORT:
      
      === USER PROFILE ===
      Name: ${userData.name || 'User'}
      Age: ${userData.age || 'Not specified'}
      Gender: ${userData.gender || 'Not specified'}
      Height: ${userData.height || 'Not specified'}
      Weight: ${userData.weight || 'Not specified'}
      Blood Group: ${userData.blood_group || 'Not specified'}
      
      === LIFESTYLE ===
      Food Preference: ${userData.food_habits || 'Not specified'}
      Activity Level: ${userData.activity_level || 'Not specified'}
      Sleep Hours: ${userData.sleep_hours || 'Not specified'}
      Screen Time: ${userData.screen_time || 'Not specified'} hours/day
      Headphone Usage: ${userData.headphone_time || 'Not specified'} hours/day
      Smoking/Alcohol: ${userData.habits_optional || 'None'}
      
      === MEDICAL ===
      Existing Conditions: ${userData.medical_conditions || 'None'}
      Past History: ${userData.past_conditions || 'None'}
      Medications: ${userData.medications || 'None'}
      Reports: ${userData.medical_reports || 'None provided'}
      
      === WEARABLE DATA ===
      Daily Steps: ${userData.steps || 'Not tracked'}
      Distance: ${userData.distance || 'Not tracked'} km
      Calories Burned: ${userData.calories || 'Not tracked'}
      Heart Rate: ${userData.heart_rate || 'Not tracked'}
      Sleep Quality: ${userData.sleep_data || 'Not tracked'}
      Stress Level: ${userData.stress_data || 'Not specified'}
      
      === ENVIRONMENT ===
      Location: ${userData.location || 'Not specified'}
      Weather: ${userData.weather || 'Not specified'}
      AQI: ${userData.aqi || 'Not specified'}
      
      === PRIMARY GOAL ===
      ${userData.goal || 'General Wellness'}
      
      Please analyze all this data and return a comprehensive JSON health report.
    `;

    const result = await model.generateContent([SYSTEM_INSTRUCTION, prompt]);
    const response = await result.response;
    const text = response.text();

    // Cleanup markdown if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
}
