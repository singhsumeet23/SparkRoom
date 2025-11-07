import React, { useState } from "react";
import { useTool } from "../context/ToolContext";

/*
 Toolbar responsibilities:
 - choose tools (select, shape, brush, eraser, text, sticky_note)
 - color picker
 - import (from computer / URL) -> dispatch window.importImage
 - export (PNG / PDF / SVG) -> dispatch window events
 - brush variants: dispatch "setBrushVariant"
*/

const SHAPES = ["rectangle", "circle", "line", "arrow", "triangle", "polygon", "pentagon", "hexagon", "star", "diamond"];

const Toolbar = () => {
  const {
    toolState,
    setTool,
    setColor,
    setBrushSize,
    setShapeFilled,
    setSelectedShape,
    setStrokeStyle,
  } = useTool();

  const {
    activeTool,
    activeColor,
    brushSize,
    shapeFilled,
    selectedShape,
    strokeStyle,
  } = toolState;

  const [showShapes, setShowShapes] = useState(false);
  const [showBrush, setShowBrush] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [brushVariant, setLocalBrushVariant] = useState("pencil");

  // NEW shape style controls
  const [borderWidth, setBorderWidth] = useState(2);
  const [fillOpacity, setFillOpacity] = useState(1);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor, setGradientColor] = useState("#00b4d8");

  const baseBtnStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#fff",
    color: "#333",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const activeBtnStyle = {
    ...baseBtnStyle,
    background: "#e0e7ff",
    color: "#3b82f6",
  };

  const handleToolChange = (tool) => {
    if (tool === activeTool) {
      setTool("select");
      setShowShapes(false);
      setShowBrush(false);
      setShowImportMenu(false);
      setShowExportMenu(false);
    } else {
      setTool(tool);
      setShowShapes(false);
      setShowBrush(false);
      setShowImportMenu(false);
      setShowExportMenu(false);
    }
  };

  /* ---------- IMPORT ---------- */
  const handleImportFromComputer = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const src = evt.target.result;
        window.dispatchEvent(new CustomEvent("importImage", { detail: { src } }));
      };
      reader.readAsDataURL(file);
    };
    input.click();
    setShowImportMenu(false);
  };

  const handleImportFromURL = () => {
    const url = prompt("Enter Image URL:");
    if (url) window.dispatchEvent(new CustomEvent("importImage", { detail: { src: url } }));
    setShowImportMenu(false);
  };

  /* ---------- EXPORT ---------- */
  const handleExport = (type) => {
    window.dispatchEvent(new CustomEvent("requestExport", { detail: { type } }));
    setShowExportMenu(false);
  };

  /* ---------- BRUSH VARIANT ---------- */
  const changeBrushVariant = (v) => {
    setLocalBrushVariant(v);
    window.dispatchEvent(new CustomEvent("setBrushVariant", { detail: { variant: v } }));
  };

  /* ---------- SHAPE STYLE DISPATCH ---------- */
  const handleShapeStyleChange = () => {
    window.dispatchEvent(
      new CustomEvent("shapeStyleUpdate", {
        detail: { borderWidth, fillOpacity, useGradient, gradientColor },
      })
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 4500,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(8px)",
        padding: 8,
        borderRadius: 10,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        display: "flex",
        gap: 6,
      }}
    >
      {/* SELECT */}
      <button
        style={activeTool === "select" ? activeBtnStyle : baseBtnStyle}
        onClick={() => handleToolChange("select")}
      >
        🖱️ Select
      </button>

      {/* SHAPES */}
      <div style={{ position: "relative" }}>
        <button
          style={activeTool === "shape" ? activeBtnStyle : baseBtnStyle}
          onClick={() => {
            handleToolChange("shape");
            setShowShapes((s) => !s);
          }}
        >
          📐 {selectedShape}
        </button>

        {showShapes && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: 10,
              zIndex: 60,
              width: 240,
            }}
          >
            {SHAPES.map((s) => (
              <button
                key={s}
                style={{
                  ...baseBtnStyle,
                  width: "100%",
                  justifyContent: "flex-start",
                }}
                onClick={() => {
                  setSelectedShape(s);
                  setShowShapes(false);
                }}
              >
                {s}
              </button>
            ))}

            <hr style={{ margin: "8px 0", border: "1px solid #eee" }} />
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={shapeFilled}
                onChange={(e) => setShapeFilled(e.target.checked)}
              />{" "}
              Filled
            </label>

            {/* NEW STYLE CONTROLS */}
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 13 }}>Border thickness: {borderWidth}</label>
              <input
                type="range"
                min="1"
                max="12"
                value={borderWidth}
                onChange={(e) => {
                  setBorderWidth(Number(e.target.value));
                  handleShapeStyleChange();
                }}
                style={{ width: "100%" }}
              />

              <label style={{ fontSize: 13 }}>Fill transparency: {(fillOpacity * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={fillOpacity}
                onChange={(e) => {
                  setFillOpacity(Number(e.target.value));
                  handleShapeStyleChange();
                }}
                style={{ width: "100%" }}
              />

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={useGradient}
                  onChange={(e) => {
                    setUseGradient(e.target.checked);
                    handleShapeStyleChange();
                  }}
                />{" "}
                Gradient fill
              </label>

              {useGradient && (
                <div style={{ marginTop: 6 }}>
                  <label style={{ fontSize: 13 }}>Gradient color</label>
                  <input
                    type="color"
                    value={gradientColor}
                    onChange={(e) => {
                      setGradientColor(e.target.value);
                      handleShapeStyleChange();
                    }}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BRUSH */}
      <div style={{ position: "relative" }}>
        <button
          style={activeTool === "brush" ? activeBtnStyle : baseBtnStyle}
          onClick={() => {
            handleToolChange("brush");
            setShowBrush((s) => !s);
          }}
        >
          🖌️ Brush
        </button>

        {showBrush && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: 12,
              width: 260,
              zIndex: 60,
            }}
          >
            <label style={{ fontSize: 13 }}>Brush Size ({brushSize})</label>
            <input
              type="range"
              min="1"
              max="80"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <label style={{ fontSize: 13, marginTop: 8 }}>Stroke style</label>
            <select
              value={strokeStyle || "solid"}
              onChange={(e) => setStrokeStyle(e.target.value)}
              style={{ width: "100%", marginTop: 6 }}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>

            <hr style={{ margin: "8px 0", border: "1px solid #f6f6f6" }} />

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ marginRight: 6 }}>Variant</label>
              <select
                value={brushVariant}
                onChange={(e) => changeBrushVariant(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="pencil">Pencil (thin)</option>
                <option value="marker">Marker (semi-transparent wide)</option>
                <option value="highlighter">Highlighter (translucent)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* OTHER TOOLS */}
      <button
        style={activeTool === "eraser" ? activeBtnStyle : baseBtnStyle}
        onClick={() => handleToolChange("eraser")}
      >
        🧹 Eraser
      </button>

      <button
        style={activeTool === "text" ? activeBtnStyle : baseBtnStyle}
        onClick={() => handleToolChange("text")}
      >
        T Text
      </button>

      <button
        style={activeTool === "sticky_note" ? activeBtnStyle : baseBtnStyle}
        onClick={() => handleToolChange("sticky_note")}
      >
        📝 Note
      </button>

      {/* COLOR PICKER */}
      <input
        type="color"
        value={activeColor}
        onChange={(e) => setColor(e.target.value)}
        style={{
          width: 36,
          height: 36,
          padding: 0,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      />

      {/* IMPORT */}
      <div style={{ position: "relative" }}>
        <button
          style={showImportMenu ? activeBtnStyle : baseBtnStyle}
          onClick={() => {
            setShowImportMenu((s) => !s);
            setShowExportMenu(false);
          }}
        >
          📥 Import
        </button>

        {showImportMenu && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: 6,
              zIndex: 60,
            }}
          >
            <button
              style={{ ...baseBtnStyle, width: 180, justifyContent: "flex-start" }}
              onClick={handleImportFromComputer}
            >
              💻 From Computer
            </button>
            <button
              style={{ ...baseBtnStyle, width: 180, justifyContent: "flex-start" }}
              onClick={handleImportFromURL}
            >
              🌐 From URL
            </button>
          </div>
        )}
      </div>

      {/* EXPORT */}
      <div style={{ position: "relative" }}>
        <button
          style={showExportMenu ? activeBtnStyle : baseBtnStyle}
          onClick={() => {
            setShowExportMenu((s) => !s);
            setShowImportMenu(false);
          }}
        >
          📤 Export
        </button>

        {showExportMenu && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: 6,
              zIndex: 60,
            }}
          >
            <button
              style={{ ...baseBtnStyle, width: 180, justifyContent: "flex-start" }}
              onClick={() => handleExport("png")}
            >
              🖼️ Export PNG
            </button>
            <button
              style={{ ...baseBtnStyle, width: 180, justifyContent: "flex-start" }}
              onClick={() => handleExport("pdf")}
            >
              📄 Export PDF
            </button>
            <button
              style={{ ...baseBtnStyle, width: 180, justifyContent: "flex-start" }}
              onClick={() => handleExport("svg")}
            >
              🧾 Export SVG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
