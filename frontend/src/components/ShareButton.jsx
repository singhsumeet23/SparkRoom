import React, { useState } from 'react';

const ShareButton = ({ documentId, isOwner, token }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Only show the button if the current user is deemed the owner
    if (!isOwner) return null;

    const handleShare = async (e) => {
        e.preventDefault();
        setMessage('Sending request...');
        
        try {
            const res = await fetch(`http://localhost:3001/api/documents/${documentId}/access`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            
            if (!res.ok) {
                setMessage(`Error: ${data.message}`);
            } else {
                setMessage(`Success! ${data.message}`);
                setEmail('');
            }
        } catch (error) {
            setMessage('Network error. Check server status.');
        }
    };

    const modalStyle = {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: 'white', padding: '30px', borderRadius: '10px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)', zIndex: 10000, minWidth: '350px'
    };
    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999
    };
    const inputStyle = { padding: '10px', width: '100%', marginBottom: '15px', border: '1px solid #ddd' };
    const buttonStyle = { padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

    return (
        <>
            <button 
                onClick={() => setShowModal(true)} 
                style={{ 
                    padding: '10px 20px', backgroundColor: '#ffc107', 
                    color: 'black', border: 'none', borderRadius: '5px', 
                    cursor: 'pointer', fontWeight: 'bold'
                }}
            >
                Share Access
            </button>
            
            {showModal && (
                <div style={overlayStyle} onClick={() => setShowModal(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <h3>Grant Access to Room</h3>
                        <p>Share this room's ID: <strong>{documentId}</strong></p>
                        
                        <form onSubmit={handleShare}>
                            <input
                                type="email"
                                placeholder="Collaborator's Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={inputStyle}
                            />
                            <button type="submit" style={buttonStyle}>Grant Access</button>
                        </form>
                        <p style={{ marginTop: '15px', color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShareButton;