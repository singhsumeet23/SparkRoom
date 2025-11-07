import React from 'react';

// Generates a simple color from a string (same function as in Avatar.jsx)
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// SVG for a standard cursor pointer
const PointerSVG = ({ color }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill={color} 
    stroke="white" 
    strokeWidth="1.5"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: 'rotate(-45deg)' }} // Rotate slightly to make it look more like a pointer
  >
    <path d="M12.922 23.332L.524 10.934a1.8 1.8 0 010-2.544l10.398-10.4a1.8 1.8 0 012.544 0l11.458 11.458a1.8 1.8 0 010 2.544L15.466 23.332a1.8 1.8 0 01-2.544 0z"/>
  </svg>
);

const Cursor = ({ position, name }) => {
  const userColor = stringToColor(name || 'default');
  
  const style = {
    position: 'absolute',
    left: 0,
    top: 0,
    // CRITICAL: Move the cursor to the exact position
    transform: `translate(${position.x}px, ${position.y}px)`,
    zIndex: 9999,
    // The main container is a flexbox to align the pointer and name
    display: 'flex', 
    alignItems: 'flex-start',
    pointerEvents: 'none', // Ensures the cursor doesn't block clicks underneath it
  };

  const nameStyle = {
    backgroundColor: userColor,
    color: 'white',
    padding: '2px 6px',
    borderRadius: '0 4px 4px 0',
    fontSize: '12px',
    fontWeight: 'bold',
    // Position the name tag slightly below and to the right of the cursor point
    marginTop: '15px', 
    marginLeft: '-5px', 
    whiteSpace: 'nowrap',
  };

  return (
    <div style={style}>
      {/* 1. The custom pointer icon */}
      <PointerSVG color={userColor} />
      
      {/* 2. The user's name label */}
      <div style={nameStyle}>
        {name}
      </div>
    </div>
  );
};

export default Cursor;