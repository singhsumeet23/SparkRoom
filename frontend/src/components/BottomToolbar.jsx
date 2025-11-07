import React from "react";
import { Undo2, Redo2, Save, FolderOpen, Share2 } from "lucide-react";

const BottomToolbar = ({ onUndo, onRedo, onSave, onLoad, onShare }) => {
  return (
    <div className="fixed bottom-4 left-4 flex gap-3 bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-3 border border-gray-200 z-50">
      <button
        onClick={onUndo}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        title="Undo"
      >
        <Undo2 size={20} />
      </button>
      <button
        onClick={onRedo}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        title="Redo"
      >
        <Redo2 size={20} />
      </button>
      <button
        onClick={onSave}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        title="Save Board"
      >
        <Save size={20} />
      </button>
      <button
        onClick={onLoad}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        title="Load Board"
      >
        <FolderOpen size={20} />
      </button>
      <button
        onClick={onShare}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        title="Share Board"
      >
        <Share2 size={20} />
      </button>
    </div>
  );
};

export default BottomToolbar;
