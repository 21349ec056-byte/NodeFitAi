/**
 * Gemini API Local Test Script
 * Run this file directly to test your API key: node test-gemini.js
 */

// For Node.js environment
import { GoogleGenerativeAI } from '@google/generative-ai';

// =========================================
// CONFIGURATION - Set your API key here
// =========================================
const API_KEY = process.env.VITE_GEMINI_API_KEY || '';

// =========================================
// Test Functions
// =========================================

async function testBasicConnection() {
    console.log('\n🔌 Test 1: Basic Connection');
    console.log('─'.repeat(40));

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent('Say "Hello from nodeFit AI!" if you can hear me.');
        const response = await result.response;
        const text = response.text();

        console.log('✅ Response:', text);
        return true;
    } catch (error) {
        console.error('❌ Failed:', error.message);
        return false;
    }
}

async function testJSONGeneration() {
    console.log('\n📋 Test 2: JSON Generation');
    console.log('─'.repeat(40));

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
      Return ONLY a valid JSON object with this structure (no markdown):
      {
        "status": "success",
        "message": "API is working",
        "timestamp": "current time"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Try to parse as JSON
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        console.log('✅ Parsed JSON:', parsed);
        return true;
    } catch (error) {
        console.error('❌ Failed:', error.message);
        return false;
    }
}

async function testHealthReportGeneration() {
    console.log('\n🏥 Test 3: Health Report Generation (Mini)');
    console.log('─'.repeat(40));

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
      Generate a mini health insight JSON for a 25 year old male who walks 8000 steps daily.
      Return ONLY valid JSON, no markdown:
      {
        "bmi": "calculated value",
        "recommendation": "one sentence tip",
        "status": "Good/Fair/Poor"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        console.log('✅ Health Insight:', parsed);
        return true;
    } catch (error) {
        console.error('❌ Failed:', error.message);
        return false;
    }
}

// =========================================
// Main Execution
// =========================================

async function runAllTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     GEMINI API TEST SUITE              ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n🔑 Using API Key: ${API_KEY.slice(0, 10)}...${API_KEY.slice(-4)}`);

    const results = {
        connection: await testBasicConnection(),
        json: await testJSONGeneration(),
        health: await testHealthReportGeneration(),
    };

    console.log('\n═'.repeat(42));
    console.log('📊 TEST RESULTS');
    console.log('═'.repeat(42));
    console.log(`   Connection:  ${results.connection ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   JSON Parse:  ${results.json ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Health Gen:  ${results.health ? '✅ PASS' : '❌ FAIL'}`);
    console.log('═'.repeat(42));

    const allPassed = Object.values(results).every(Boolean);

    if (allPassed) {
        console.log('\n🎉 All tests passed! Your API key is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. See troubleshooting below:');
        console.log('\n📋 TROUBLESHOOTING STEPS:');
        console.log('   1. Verify your API key is correct');
        console.log('   2. Check if key is enabled at https://aistudio.google.com/apikey');
        console.log('   3. Ensure you have not exceeded rate limits');
        console.log('   4. Try generating a new API key');
        console.log('   5. Check your network connection');
    }
}

runAllTests();
