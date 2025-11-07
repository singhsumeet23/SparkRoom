import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AIPromptModal = ({ onClose, createElement, getCanvasCoordinates }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Get center of current screen
        const centerCoords = getCanvasCoordinates(); 

        try {
            const res = await fetch('http://localhost:3001/api/ai/generate-stickies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    prompt,
                    startX: centerCoords.x - 400, // Start to the left
                    startY: centerCoords.y,
                }),
            });

            const newElements = await res.json();
            if (!res.ok) {
                throw new Error(newElements.message || 'AI generation failed');
            }
            
            // Create all the new elements
            newElements.forEach(el => createElement(el));
            setIsLoading(false);
            onClose(); // Close modal on success

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const modalStyle = { /* ... (Same as Share Modal) ... */ };
    
    return (
        <div style={{ ...modalStyle, zIndex: 6000 }} onClick={onClose}>
            <div style={{ ...modalStyle, background: 'white', padding: 24, width: 400, borderRadius: 12 }} onClick={(e) => e.stopPropagation()}>
                <h3>Generate Sticky Notes</h3>
                <p>Enter a topic, and the AI will brainstorm ideas for you.</p>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Marketing ideas for a new coffee shop..."
                        style={{ width: '100%', height: '100px', padding: '10px', borderRadius: 8, border: '1px solid #ddd', marginBottom: '15px' }}
                    />
                    <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', background: 'var(--color-primary)', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                        {isLoading ? 'Generating...' : 'Generate Ideas'}
                    </button>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default AIPromptModal;