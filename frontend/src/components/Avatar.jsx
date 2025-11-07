import React from 'react';

// Generates a simple color from a string (Unchanged)
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

// UPDATED: Now accepts a 'user' object and an 'onClick' function
const Avatar = ({ user, onClick }) => {
  const initial = user.name ? user.name[0].toUpperCase() : '?';
  const color = stringToColor(user.name || 'default');

  const style = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: color,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '5px',
    overflow: 'hidden',
    border: '2px solid white',
    boxShadow: '0 0 5px rgba(0,0,0,0.3)',
    cursor: 'pointer', // Make it look clickable
    padding: 0, // Reset button padding
    transition: 'transform 0.2s ease',
  };

  const hoverStyle = (e) => {
    e.currentTarget.style.transform = 'scale(1.1)';
  };

  const unHoverStyle = (e) => {
    e.currentTarget.style.transform = 'scale(1.0)';
  };

  return (
    <button 
      style={style} 
      onClick={(e) => onClick(e, user)}
      onMouseEnter={hoverStyle}
      onMouseLeave={unHoverStyle}
    >
      {initial}
    </button>
  );
};

export default Avatar;