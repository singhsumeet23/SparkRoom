import React, { useState, useEffect } from 'react';
import { useUI } from '../context/UIContext';

const BackgroundSettings = ({ textColor }) => { 
    const { backgroundStyle, updateBackground } = useUI();
    
    // Initialize colorInput with the active color
    const [colorInput, setColorInput] = useState(backgroundStyle.style.backgroundColor || '#f4f4f9'); 

    useEffect(() => {
        const activeColor = backgroundStyle.style.backgroundColor;
        if (activeColor) {
            setColorInput(activeColor);
        }
    }, [backgroundStyle.style.backgroundColor]);

    // Solid Color Options
    const presetColors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#333333', '#f4f4f9', '#4682B4'];

    // Gradient and Pattern Options
    const complexBackgrounds = [
        // NEW: This mimics the style of the image you sent
        { 
          name: 'Abstract Flow', 
          style: { 
            backgroundImage: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' 
          },
          isDark: true // Mark this as a dark background
        },
        { name: 'Ocean Gradient', style: { backgroundImage: 'linear-gradient(135deg, #00c6ff, #0072ff)' }, isDark: false },
        { name: 'Subtle Grid', style: { backgroundColor: '#e9e9e9', backgroundImage: 'linear-gradient(0deg, transparent 9px, rgba(0,0,0,0.05) 10px), linear-gradient(90deg, transparent 9px, rgba(0,0,0,0.05) 10px)', backgroundSize: '10px 10px' }, isDark: false },
        { name: 'Dark Slate', style: { backgroundColor: '#2f4f4f' }, isDark: true }
    ];

    const handleColorChange = (e) => {
        const hex = e.target.value;
        setColorInput(hex);
        updateBackground({ backgroundColor: hex }, true); // Pass 'true' to check for darkness
    };

    const handlePresetClick = (hex) => {
        setColorInput(hex);
        updateBackground({ backgroundColor: hex }, true);
    };
    
    const handleComplexClick = (bg) => {
        // Reset color input when selecting a complex bg
        setColorInput('#f4f4f9'); 
        updateBackground(bg.style, bg.isDark); // Pass the 'isDark' flag
    }

    const modalStyle = {
        position: 'fixed', top: '50%', right: '10px', transform: 'translateY(-50%)',
        backgroundColor: 'var(--color-card)', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-popup)', zIndex: 10000, minWidth: '300px',
        color: 'var(--color-text-dark)', 
    };
    
    const colorCircleStyle = (hex) => ({
        width: '30px', height: '30px', borderRadius: '50%', 
        backgroundColor: hex, cursor: 'pointer', border: '2px solid var(--color-background)'
    });
    
    const complexButtonStyle = { 
        padding: '8px 15px', borderRadius: 'var(--border-radius)', 
        border: '1px solid #ddd', background: 'white', cursor: 'pointer', 
        marginBottom: '8px', marginRight: '8px' 
    };
    
    const textStyle = { color: textColor }; // Use passed-in textColor for modal text

    return (
        <div style={modalStyle}>
            <h4 style={textStyle}>Dashboard Background Settings</h4>
            <div style={{ marginBottom: '20px' }}>
                <h5 style={textStyle}>Solid Color Picker</h5>
                <input 
                    type="color" 
                    value={colorInput} 
                    onChange={handleColorChange} 
                    style={{ width: '100%', height: '40px', border: 'none', marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    {presetColors.map(hex => (
                        <div 
                            key={hex} 
                            style={colorCircleStyle(hex)} 
                            onClick={() => handlePresetClick(hex)} 
                        />
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <h5 style={textStyle}>Patterns & Gradients</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {complexBackgrounds.map(bg => (
                        <button 
                            key={bg.name} 
                            style={complexButtonStyle} 
                            onClick={() => handleComplexClick(bg)}
                        >
                            {bg.name}
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={() => updateBackground({ backgroundColor: '#f4f4f9' }, true)} style={{ padding: '8px 15px', background: 'var(--color-danger)', color: 'white', marginTop: '10px', borderRadius: 'var(--border-radius)' }}>
                Reset to Default
            </button>
        </div>
    );
};

export default BackgroundSettings;