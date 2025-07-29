// Simple Gemini API test using curl
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testGeminiAPI() {
  try {
    console.log('🔍 Testing Gemini API key...');
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      return;
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('✅ API key found:', apiKey.substring(0, 10) + '...');
    
    // Test with Gemini 1.5 Flash (more reliable than experimental models)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{
          text: "Respond with exactly: 'Gemini API is working correctly!'"
        }]
      }]
    };
    
    const curlCmd = `curl -s -X POST "${url}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`;
    
    console.log('📡 Sending test request...');
    
    const { stdout, stderr } = await execAsync(curlCmd);
    
    if (stderr) {
      console.error('❌ Curl error:', stderr);
      return;
    }
    
    const response = JSON.parse(stdout);
    
    if (response.error) {
      console.error('❌ API Error:', response.error.message);
      if (response.error.code === 400) {
        console.error('💡 This usually means the API key is invalid or has wrong permissions');
      }
      return;
    }
    
    if (response.candidates && response.candidates[0]) {
      const text = response.candidates[0].content.parts[0].text;
      console.log('✅ Gemini Response:', text);
      console.log('✅ Gemini API test successful!');
    } else {
      console.error('❌ Unexpected response format:', response);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGeminiAPI();