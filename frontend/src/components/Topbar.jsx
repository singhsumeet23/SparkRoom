import React from 'react';
import { useNavigate } from 'react-router-dom';
import ShareButton from './ShareButton';

const Topbar = ({ documentName, ownerName, documentId, isOwner, token }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: 'absolute',
        top: 'var(--spacing-md)',
        right: 'var(--spacing-md)',
        zIndex: 1000,
        display: 'flex',
        gap: 'var(--spacing-md)',
        alignItems: 'center',
        padding: '10px 15px',
        backgroundColor: 'var(--color-card)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-medium)',
      }}
    >
      {/* Document title and owner */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: '10px' }}>
        <h3 style={{ margin: 0, color: 'var(--color-text-dark)' }}>{documentName}</h3>
        <span style={{ fontSize: '12px', color: '#666' }}>Owned by {ownerName}</span>
      </div>

      {/* Share button */}
      <ShareButton documentId={documentId} isOwner={isOwner} token={token} />

      {/* Exit room */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-light)',
          borderRadius: 'var(--border-radius)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Exit Room
      </button>
    </div>
  );
};

export default Topbar;
