// Test script to verify AI analysis pipeline
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000';
const testData = {
  username: 'test-strategist',
  password: 'password123'
};

async function testAIAnalysisPipeline() {
  console.log('🧪 Testing AI Analysis Pipeline...\n');

  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginResult = await loginResponse.json();
    console.log('✅ Login successful');

    // Extract session cookie
    const cookies = loginResponse.headers.get('set-cookie');

    // Step 2: Create a test project
    console.log('\n2. Creating test project...');
    const projectResponse = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies 
      },
      body: JSON.stringify({
        name: 'AI Analysis Test Project',
        description: 'Testing automatic AI analysis pipeline',
        briefTemplate: 'jimmy-johns'
      })
    });

    if (!projectResponse.ok) {
      throw new Error(`Project creation failed: ${projectResponse.status}`);
    }

    const project = await projectResponse.json();
    console.log('✅ Project created:', project.name);

    // Step 3: Create a text capture (should trigger AI analysis)
    console.log('\n3. Creating text capture...');
    const textCaptureResponse = await fetch(`${baseUrl}/api/captures`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies 
      },
      body: JSON.stringify({
        projectId: project.id,
        title: 'TikTok Dancing Trend Goes Viral',
        content: 'A new dance trend on TikTok has exploded with over 50 million views in just 3 days. The #ChallengeDance hashtag is being used by Gen Z users worldwide, with brands like Nike and McDonald\'s already jumping on the trend. The dance involves simple moves that anyone can learn, making it highly accessible. Cultural experts say this represents a shift towards more inclusive social media trends.',
        type: 'text',
        sourceUrl: 'https://example.com/tiktok-trend',
        userNote: 'This could be huge for our social media strategy'
      })
    });

    if (!textCaptureResponse.ok) {
      throw new Error(`Text capture creation failed: ${textCaptureResponse.status}`);
    }

    const textCapture = await textCaptureResponse.json();
    console.log('✅ Text capture created:', textCapture.capture.title);
    console.log('   Analysis Status:', textCapture.capture.analysisStatus || 'pending');

    // Step 4: Wait and check analysis status
    console.log('\n4. Checking analysis progress...');
    let analysisComplete = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!analysisComplete && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const statusResponse = await fetch(`${baseUrl}/api/captures/${textCapture.capture.id}/analysis-status`, {
        headers: { 'Cookie': cookies }
      });

      if (statusResponse.ok) {
        const status = await statusResponse.json();
        console.log(`   Attempt ${attempts}: Analysis Status = ${status.analysisStatus}, Processing = ${status.processingStatus}`);
        
        if (status.analysisStatus === 'completed' || status.analysisStatus === 'failed') {
          analysisComplete = true;
          
          if (status.hasAnalysis) {
            console.log('✅ Analysis completed successfully!');
            console.log('   Strategic Value:', status.strategicValue);
            console.log('   Viral Potential:', status.viralPotential);
            console.log('   Confidence Score:', status.confidenceScore);
          } else {
            console.log('⚠️ Analysis completed but no results found');
          }
        }
      }
    }

    if (!analysisComplete) {
      console.log('⏰ Analysis still in progress after', maxAttempts, 'attempts');
    }

    // Step 5: Get the updated capture with analysis results
    console.log('\n5. Fetching complete capture data...');
    const updatedCaptureResponse = await fetch(`${baseUrl}/api/captures/${textCapture.capture.id}`, {
      headers: { 'Cookie': cookies }
    });

    if (updatedCaptureResponse.ok) {
      const updatedCapture = await updatedCaptureResponse.json();
      
      if (updatedCapture.truthAnalysis) {
        console.log('\n🧠 Truth Analysis Results:');
        console.log('   Fact:', updatedCapture.truthAnalysis.fact?.substring(0, 100) + '...');
        console.log('   Insight:', updatedCapture.truthAnalysis.insight?.substring(0, 100) + '...');
        console.log('   Human Truth:', updatedCapture.truthAnalysis.humanTruth?.substring(0, 100) + '...');
        console.log('   Brief Section:', updatedCapture.truthAnalysis.briefSectionSuggestion);
        console.log('   Keywords:', updatedCapture.truthAnalysis.keywords?.join(', '));
      }

      if (updatedCapture.visualAnalysis) {
        console.log('\n🎨 Visual Analysis Results:');
        console.log('   Brand Elements:', updatedCapture.visualAnalysis.brandElements?.length || 0);
        console.log('   Cultural Moments:', updatedCapture.visualAnalysis.culturalMoments?.length || 0);
      }
    }

    console.log('\n🎉 AI Analysis Pipeline Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAIAnalysisPipeline();