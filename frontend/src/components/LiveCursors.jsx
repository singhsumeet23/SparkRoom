import React from 'react';
import { useRoom } from '../hooks/useRoom'; // <-- IMPORT UNIFIED HOOK
import Cursor from './Cursor';

const LiveCursors = () => {
  const { cursors } = useRoom(); // Get cursors from the new hook

  return (
    <div>
      {cursors.map((cursor, index) => (
        <Cursor
          key={index}
          position={cursor.position}
          name={cursor.name}
        />
      ))}
    </div>
  );
};

export default LiveCursors;