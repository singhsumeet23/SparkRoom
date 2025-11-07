const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { v4: uuidv4 } = require('uuid');

// This is a placeholder for a real AI call.
// For this hackathon, we'll return mock data based on the prompt.
const callAIBrainstorm = async (prompt) => {
    // In a real app, you'd call:
    // const response = await openai.chat.completions.create({...});
    // const ideas = JSON.parse(response.choices[0].message.content);
    
    // HACKATHON MOCK:
    const mockIdeas = [
        `Idea 1 based on: ${prompt}`,
        `Idea 2 based on: ${prompt}`,
        `A third idea`,
        `What about this?`,
        `Final concept`,
    ];
    return mockIdeas;
};

router.post('/generate-stickies', protect, async (req, res) => {
    const { prompt, startX, startY } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        const ideas = await callAIBrainstorm(prompt);
        
        // Convert ideas into element objects
        const newElements = ideas.map((idea, index) => {
            return {
                id: uuidv4(),
                type: 'sticky_note',
                x: (startX || 100) + (index * 220) % 800, // Stagger them
                y: (startY || 400) + Math.floor(index / 4) * 220,
                width: 200,
                height: 200,
                content: idea,
                fontSize: 20,
                fill: '#333333',
                backgroundColor: '#FFF9C4'
            };
        });
        
        res.status(201).json(newElements);

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "Error generating AI content" });
    }
});

module.exports = router;