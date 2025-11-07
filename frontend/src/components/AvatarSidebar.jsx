import React, { useState } from 'react';
import { useRoom } from '../hooks/useRoom'; // <-- IMPORT UNIFIED HOOK
import Avatar from './Avatar';
import UserProfilePopup from './UserProfilePopup';

const AvatarSidebar = ({ ownerName }) => {
  const { users } = useRoom(); // Get the list of users from the new hook
  
  const [popupState, setPopupState] = useState({ user: null, position: null });

  const handleAvatarClick = (event, user) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupState({
      user: user,
      position: { top: rect.top, left: rect.right + 10 }
    });
  };

  const handleClosePopup = () => {
    setPopupState({ user: null, position: null });
  };

  const style = {
    position: 'fixed',
    top: 'var(--spacing-md)',
    left: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--spacing-sm)',
    backgroundColor: 'var(--color-card)', 
    borderRadius: 'var(--border-radius)',
    boxShadow: 'var(--shadow-medium)', 
    zIndex: 100,
  };

  return (
    <>
      <div style={style}>
        {users.map((user) => (
          <Avatar 
            key={user.id} 
            user={user} 
            onClick={handleAvatarClick} 
          />
        ))}
      </div>

      {popupState.user && (
        <UserProfilePopup 
          user={popupState.user}
          isOwner={popupState.user.name === ownerName}
          position={popupState.position}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default AvatarSidebar;