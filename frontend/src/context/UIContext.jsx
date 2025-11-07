import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

// Helper to determine if a hex color is 'dark' for contrast
const isColorDark = (hex) => {
    if (!hex || hex.length !== 7) return false;
    // Convert hex to RGB components
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Calculate relative luminance (using common formula)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Return true if luminance is below a threshold (e.g., 0.5)
    return luminance < 0.5;
};

export const UIProvider = ({ children }) => {
    // backgroundStyle will now always contain { style: {}, isDark: boolean }
    const [backgroundStyle, setBackgroundStyle] = useState({ 
        style: { backgroundColor: '#f4f4f9' }, 
        isDark: false 
    });

    useEffect(() => {
        const savedStyle = localStorage.getItem('dashboardBg');
        if (savedStyle) {
            try {
                // Ensure the saved data is in the new format {style, isDark}
                setBackgroundStyle(JSON.parse(savedStyle)); 
            } catch (e) {
                console.error("Failed to parse saved background style.");
                localStorage.removeItem('dashboardBg');
            }
        }
    }, []);

    const updateBackground = (style, isColorInput = false) => {
        let isDark = false;
        if (isColorInput && style.backgroundColor) {
             isDark = isColorDark(style.backgroundColor);
        }

        setBackgroundStyle({ style, isDark });
        localStorage.setItem('dashboardBg', JSON.stringify({ style, isDark }));
    };

    return (
        <UIContext.Provider value={{ backgroundStyle, updateBackground }}>
            {children}
        </UIContext.Provider>
    );
};