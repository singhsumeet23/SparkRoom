import React from 'react';
import { useTool } from '../context/ToolContext'; // To get/set the active color

const PanelRow = ({ label, children }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  }}>
    <label style={{ color: '#555', fontSize: '14px' }}>{label}</label>
    {children}
  </div>
);

const ElementStylePanel = ({ element, updateElement }) => {
  const { toolState, setColor } = useTool();

  if (!element) return null;

  const { type, fill, backgroundColor, fontSize } = element;

  const handleFillChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor); // Update global color
    updateElement(element.id, { fill: newColor, stroke: newColor });
  };

  const handleBgChange = (e) => {
    updateElement(element.id, { backgroundColor: e.target.value });
  };

  const handleFontSizeChange = (e) => {
    updateElement(element.id, { fontSize: parseInt(e.target.value, 10) });
  };

  return (
    <div style={{
      position: 'absolute',
      // Position it to the right of the element
      top: element.y,
      left: element.x + element.width + 20,
      width: '200px',
      padding: '15px',
      backgroundColor: 'var(--color-card)',
      borderRadius: 'var(--border-radius)',
      boxShadow: 'var(--shadow-popup)',
      zIndex: 2000,
    }}>
      <h4 style={{ margin: 0, marginBottom: '15px', color: 'var(--color-text-dark)' }}>Edit Element</h4>
      
      {/* --- Fill / Stroke Color --- */}
      {(type === 'rectangle' || type === 'circle' || type === 'line' || type === 'arrow') && (
        <PanelRow label="Color">
          <input
            type="color"
            value={fill || toolState.activeColor}
            onChange={handleFillChange}
            style={{ width: '40px', height: '30px', border: 'none', padding: 0 }}
          />
        </PanelRow>
      )}

      {/* --- Text Color --- */}
      {(type === 'text' || type === 'sticky_note') && (
        <PanelRow label="Text Color">
          <input
            type="color"
            value={fill || '#000000'}
            onChange={handleFillChange}
            style={{ width: '40px', height: '30px', border: 'none', padding: 0 }}
          />
        </PanelRow>
      )}

      {/* --- Background Color --- */}
      {(type === 'text' || type === 'sticky_note') && (
        <PanelRow label="Background">
          <input
            type="color"
            value={backgroundColor || '#FFFFFF'}
            onChange={handleBgChange}
            style={{ width: '40px', height: '30px', border: 'none', padding: 0 }}
          />
        </PanelRow>
      )}

      {/* --- Font Size --- */}
      {(type === 'text' || type === 'sticky_note') && (
        <PanelRow label="Font Size">
          <input
            type="number"
            min="8"
            max="120"
            value={fontSize || 16}
            onChange={handleFontSizeChange}
            style={{ width: '60px', padding: '5px' }}
          />
        </PanelRow>
      )}
    </div>
  );
};

export default ElementStylePanel;