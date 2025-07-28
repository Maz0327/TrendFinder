require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function fetchSampleStory() {
  return {
    title: 'Kendrick vs. Drake Beef Escalates',
    url: 'https://example.com/beef',
    content: 'Fans are going crazy after new diss tracks dropped over the weekend...',
    category: 'pop-culture'
  };
}

async function generateHooksAndSummary(content) {
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a viral content strategist. Summarize the story in 2 sentences, then give 2 hooks.' },
      { role: 'user', content }
    ]
  });

  const output = res.data.choices[0].message.content;
  const [summary, hook1, hook2] = output.split('\n').filter(Boolean);
  return {
    summary,
    hook1: hook1.replace(/^1\. /, ''),
    hook2: hook2.replace(/^2\. /, '')
  };
}

app.get('/run-agent', async (req, res) => {
  const story = await fetchSampleStory();
  const { summary, hook1, hook2 } = await generateHooksAndSummary(story.content);

  const { error } = await supabase.from('content_radar').insert({
    title: story.title,
    url: story.url,
    category: story.category,
    summary,
    hook1,
    hook2
  });

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).send('Error saving to Supabase');
  }

  res.send({ message: 'Radar saved successfully', summary, hook1, hook2 });
});

app.listen(3000, () => console.log('Agent running on port 3000'));
