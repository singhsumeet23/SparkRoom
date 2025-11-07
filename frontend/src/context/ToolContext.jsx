import React, { createContext, useContext, useState } from 'react';

const ToolContext = createContext();

export const useTool = () => useContext(ToolContext);

export const ToolProvider = ({ children }) => {
    const [toolState, setToolState] = useState({
        activeTool: 'select', // 'select', 'brush', 'shape'
        activeColor: '#3b82f6', 
        brushSize: 6,
        shapeFilled: true,
        selectedShape: 'rectangle', // 'rectangle', 'circle', etc.
    });

    const setTool = (tool) => setToolState(prev => ({ ...prev, activeTool: tool }));
    const setColor = (color) => setToolState(prev => ({ ...prev, activeColor: color }));
    const setBrushSize = (size) => setToolState(prev => ({ ...prev, brushSize: Number(size) }));
    const setShapeFilled = (filled) => setToolState(prev => ({ ...prev, shapeFilled: filled }));
    const setSelectedShape = (shape) => setToolState(prev => ({ ...prev, selectedShape: shape }));

    return (
        <ToolContext.Provider 
            value={{ 
                toolState, 
                setTool, 
                setColor, 
                setBrushSize, 
                setShapeFilled, 
                setSelectedShape 
            }}
        >
            {children}
        </ToolContext.Provider>
    );
};