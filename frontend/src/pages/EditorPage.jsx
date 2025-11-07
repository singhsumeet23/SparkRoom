import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import AvatarSidebar from '../components/AvatarSidebar';
import LiveCursors from '../components/LiveCursors';
import Whiteboard from '../components/Whiteboard';
import ShareButton from '../components/ShareButton';
import ChatSidebar from '../components/ChatSidebar';

const EditorPage = () => {
  const { documentId } = useParams();
  const { myUser, token, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [documentName, setDocumentName] = useState('Loading...');
  const [isOwner, setIsOwner] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [sidebarOffset, setSidebarOffset] = useState(0); // track chat sidebar offset for adaptive topbar

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token || !myUser) {
      navigate('/');
      return;
    }

    const fetchDoc = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/documents/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          alert(data.message || 'Access Denied or Document Not Found.');
          navigate('/dashboard');
          return;
        }

        setDocumentName(data.name || 'Untitled Document');
        setOwnerName(data.owner?.name || data.ownerName || 'Unknown');
        if (data.owner && String(data.owner.id) === String(myUser.id)) setIsOwner(true);
        if (data.ownerId && String(data.ownerId) === String(myUser.id)) setIsOwner(true);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching document:', err);
        navigate('/dashboard');
      }
    };

    fetchDoc();
  }, [documentId, token, isAuthenticated, authLoading, myUser, navigate]);

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Connecting...</h2>
      </div>
    );
  }

  return (
    <div className="editor-page-container" style={{ minHeight: '100vh', position: 'relative' }}>
      <AvatarSidebar ownerName={ownerName} />
      <LiveCursors />

      {/* Adaptive Top Bar (moves when chat sidebar is dragged out) */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: `calc(16px + ${sidebarOffset}px)`,
          zIndex: 5000,
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: 'var(--color-card)',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-medium)',
          transition: 'right 0.25s ease',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-text-dark)' }}>{documentName}</h3>
          <div style={{ fontSize: 12, color: '#666' }}>Owned by {ownerName}</div>
        </div>

        {isOwner && <ShareButton documentId={documentId} isOwner={isOwner} token={token} />}

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-light)',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Exit Room
        </button>
      </div>

      {/* Chat Sidebar (draggable). It calls onSidebarMove(offset) with horizontal offset */}
      <ChatSidebar onSidebarMove={(offset) => setSidebarOffset(offset)} />

      {/* Main Whiteboard */}
      <Whiteboard documentId={documentId} />
    </div>
  );
};

export default EditorPage;
