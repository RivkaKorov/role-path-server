require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());


app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;

    res.json({
      message: message,
      reply: reply,
    });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
    });
  }
});

app.post('/api/generate-questions', async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const prompt = `Determine if "${role}" is a role in the programming or software development world (e.g., developer, engineer, coder, etc.). If it is not, respond with an empty JSON object {}.

If it is a programming role, generate exactly 3 questions that can guide an AI to suggest learning topics to deepen a user's knowledge in that role. Each question must have exactly 3 multiple-choice options.

Respond only with a JSON array of objects, each with "question" and "options" (an array of 3 strings), or {} if not a programming role.

Example format for programming role:
[{"question": "What is your experience level?", "options": ["Beginner", "Intermediate", "Advanced"]}, {"question": "Which area interests you most?", "options": ["Frontend", "Backend", "DevOps"]}, {"question": "What is your preferred programming language?", "options": ["JavaScript", "Python", "Java"]}]

Do not include any other text or explanations.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that responds only with valid JSON. No other text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON response from OpenAI' });
    }

    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      return res.json({});
    } else if (Array.isArray(parsed) && parsed.length === 3) {
      const isValid = parsed.every(item =>
        typeof item === 'object' &&
        item.question &&
        Array.isArray(item.options) &&
        item.options.length === 3
      );
      if (isValid) {
        return res.json(parsed);
      }
    }

    return res.status(500).json({ error: 'Response does not match expected schema' });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
    });
  }
});

app.post('/api/generate-learning-path', async (req, res) => {
  try {
    const { role, questionsAndAnswers } = req.body;

    if (!role || !questionsAndAnswers) {
      return res.status(400).json({ error: 'Role and questionsAndAnswers are required' });
    }

    const prompt = `Based on the role "${role}" and the following questions and answers: "${questionsAndAnswers}", give 3 topics for learning to deepen the user's knowledge in that role, and for each topic, provide 4 links for starting to learn these topics immediately. Respond only with a JSON object in the format: {"topics": [{"topic": "Topic Name", "links": ["link1", "link2", "link3", "link4"]}, {"topic": "Topic Name", "links": ["link1", "link2", "link3", "link4"]}, {"topic": "Topic Name", "links": ["link1", "link2", "link3", "link4"]}]}. Do not include any other text or explanations.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that responds only with valid JSON. No other text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON response from OpenAI' });
    }

    if (typeof parsed === 'object' && parsed.topics && Array.isArray(parsed.topics) && parsed.topics.length === 3) {
      const isValid = parsed.topics.every(item =>
        typeof item === 'object' &&
        typeof item.topic === 'string' &&
        Array.isArray(item.links) &&
        item.links.length === 4 &&
        item.links.every(link => typeof link === 'string')
      );
      if (isValid) {
        return res.json(parsed);
      }
    }

    return res.status(500).json({ error: 'Response does not match expected schema' });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
    });
  }
});

module.exports = app;
