import React from 'react';

const UserProfilePopup = ({ user, position, onClose }) => {
  
  // --- Styles ---
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent', // Invisible overlay to catch clicks
    zIndex: 1000, // Just behind the popup
  };

  const popupStyle = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    backgroundColor: 'var(--color-card)',
    borderRadius: 'var(--border-radius)',
    boxShadow: 'var(--shadow-popup)',
    zIndex: 1001,
    padding: 'var(--spacing-md)',
    width: '250px',
  };

  const headerStyle = {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: 'var(--color-text-dark)',
    marginBottom: 'var(--spacing-md)',
  };

  const infoStyle = {
    fontSize: '0.9rem',
    color: '#666',
  };

  return (
    <>
      {/* Click-away overlay */}
      <div style={overlayStyle} onClick={onClose} />
      
      {/* Popup Card */}
      <div style={popupStyle}>
        <div style={headerStyle}>
          {user.name}
        </div>
        
        {/* NOTE: We currently only have the user's name.
          To show Email/Access, we must update the backend (socketHandler.js) 
          and EditorPage.jsx to send that data on 'join-room'.
        */}
        <div style={infoStyle}>
          <p>Email: {user.email || 'Not available'}</p>
          <p>Access: {user.isOwner ? 'Owner' : 'Member'}</p>
        </div>
      </div>
    </>
  );
};

export default UserProfilePopup;