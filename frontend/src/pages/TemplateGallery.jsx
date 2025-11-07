// src/components/TemplateGallery.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import templates from "./templates/templatesIndex";

export default function TemplateGallery() {
  const navigate = useNavigate();

  const handleTemplateClick = (tpl) => {
    const roomId = crypto.randomUUID(); // Generate random room
    navigate(`/whiteboard/${roomId}?template=${tpl.id}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((tpl) => (
        <div
          key={tpl.id}
          className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
          onClick={() => handleTemplateClick(tpl)}
        >
          <img
            src={tpl.thumbnail}
            alt={tpl.name}
            className="w-full h-40 object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{tpl.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{tpl.description}</p>
            <button
              className="mt-1 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                handleTemplateClick(tpl);
              }}
            >
              Use Template
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
