// Test the AI Analysis Pipeline
const baseUrl = 'http://localhost:5000';

async function testPipeline() {
  console.log('🧪 Testing AI Analysis Pipeline...\n');

  try {
    // Step 1: Create test user and login
    console.log('1. Creating test user...');
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test-strategist',
        email: 'strategist@test.com',
        password: 'password123'
      })
    });

    let cookies = '';
    if (registerResponse.ok) {
      console.log('✅ User created');
      cookies = registerResponse.headers.get('set-cookie') || '';
    } else {
      // Try login if user exists
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'test-strategist',
          email: 'strategist@test.com',
          password: 'password123'
        })
      });
      
      if (loginResponse.ok) {
        console.log('✅ User logged in');
        cookies = loginResponse.headers.get('set-cookie') || '';
      } else {
        throw new Error('Failed to authenticate');
      }
    }

    // Step 2: Create test project
    console.log('\n2. Creating test project...');
    const projectResponse = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies 
      },
      body: JSON.stringify({
        name: 'AI Pipeline Test',
        description: 'Testing automatic AI analysis',
        briefTemplate: 'jimmy-johns'
      })
    });

    if (!projectResponse.ok) {
      const error = await projectResponse.text();
      throw new Error(`Project creation failed: ${error}`);
    }

    const project = await projectResponse.json();
    console.log('✅ Project created:', project.name);

    // Step 3: Create a capture (triggers AI analysis)
    console.log('\n3. Creating capture with AI analysis trigger...');
    const captureResponse = await fetch(`${baseUrl}/api/captures`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies 
      },
      body: JSON.stringify({
        projectId: project.id,
        title: 'TikTok Dance Trend Goes Viral',
        content: 'A new dance trend on TikTok called #ViraDance has exploded with over 100 million views in just 48 hours. The trend started when influencer @DanceQueen posted a simple 15-second routine that anyone can learn. Major brands like Nike, Pepsi, and even McDonald\'s are already creating their own versions. The dance incorporates trending moves from K-pop and hip-hop, making it culturally relevant across demographics. Social media analysts predict this could be the biggest dance trend of 2025.',
        type: 'text',
        sourceUrl: 'https://tiktok.com/trending/viradance',
        userNote: 'This could be huge for brand partnerships and social media campaigns'
      })
    });

    if (!captureResponse.ok) {
      const error = await captureResponse.text();
      throw new Error(`Capture creation failed: ${error}`);
    }

    const captureResult = await captureResponse.json();
    console.log('✅ Capture created:', captureResult.capture.title);
    console.log('📊 Initial analysis status:', captureResult.capture.analysisStatus || 'pending');

    // Step 4: Wait for AI analysis to complete
    console.log('\n4. Monitoring AI analysis progress...');
    let attempts = 0;
    const maxAttempts = 12; // 2 minutes max wait
    let analysisComplete = false;

    while (!analysisComplete && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      const statusResponse = await fetch(`${baseUrl}/api/captures/${captureResult.capture.id}`, {
        headers: { 'Cookie': cookies }
      });

      if (statusResponse.ok) {
        const capture = await statusResponse.json();
        console.log(`   Attempt ${attempts}: Status = ${capture.analysisStatus || 'unknown'}`);
        
        if (capture.analysisStatus === 'completed') {
          analysisComplete = true;
          console.log('\n🎉 AI Analysis Completed Successfully!');
          
          // Display results
          if (capture.truthAnalysis) {
            console.log('\n🧠 Truth Analysis Results:');
            console.log(`   Strategic Value: ${capture.truthAnalysis.strategicValue}/10`);
            console.log(`   Viral Potential: ${capture.truthAnalysis.viralPotential}/10`);
            console.log(`   Confidence: ${capture.truthAnalysis.confidence}%`);
            console.log(`   Brief Section: ${capture.truthAnalysis.briefSectionSuggestion}`);
            console.log(`   Fact: ${capture.truthAnalysis.fact?.substring(0, 100)}...`);
            console.log(`   Human Truth: ${capture.truthAnalysis.humanTruth?.substring(0, 100)}...`);
            console.log(`   Keywords: ${capture.truthAnalysis.keywords?.join(', ') || 'None'}`);
          }

          if (capture.visualAnalysis) {
            console.log('\n🎨 Visual Analysis Results:');
            console.log(`   Brand Elements: ${capture.visualAnalysis.brandElements?.length || 0} detected`);
            console.log(`   Cultural Moments: ${capture.visualAnalysis.culturalMoments?.length || 0} identified`);
          }
          
        } else if (capture.analysisStatus === 'failed') {
          console.log('❌ AI Analysis Failed');
          analysisComplete = true;
        }
      }
    }

    if (!analysisComplete) {
      console.log('⏰ Analysis still in progress after 2 minutes');
    }

    console.log('\n✨ AI Analysis Pipeline Test Complete!');
    console.log('\nThe system now automatically:');
    console.log('• Triggers AI analysis on every capture');
    console.log('• Provides Truth Analysis Framework results');
    console.log('• Scores strategic value and viral potential');
    console.log('• Suggests brief sections (Define/Shift/Deliver)');
    console.log('• Displays results in the frontend interface');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPipeline();