// src/components/Whiteboard.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRoom } from "../hooks/useRoom";
import { useTool } from "../context/ToolContext";
import { useAuth } from "../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import WhiteboardElement from "./WhiteboardElement";
import Toolbar from "./Toolbar";
import ChatSidebar from "./ChatSidebar";
import debounce from "lodash.debounce";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ---------- Helpers ---------- */
function getSvgPathFromStroke(points) {
  if (!points || points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
  return d;
}

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const h = hex.replace("#", "");
  const normalized = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ---------- Brush stroke renderer ---------- */
const BrushStrokeRenderer = ({ element }) => {
  const { x = 0, y = 0, points = [], fill = "#000", brushSize = 6, opacity = 1 } = element;
  if (!points || points.length === 0) return null;
  const relativePoints = points.map((p) => ({ x: p.x - x, y: p.y - y }));
  return (
    <svg
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: Math.max(1, element.width || 0),
        height: Math.max(1, element.height || 0),
        pointerEvents: "none",
        overflow: "visible",
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={getSvgPathFromStroke(relativePoints)}
        stroke={fill}
        strokeWidth={brushSize}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ opacity }}
      />
    </svg>
  );
};

/* ---------- Whiteboard Component ---------- */
const Whiteboard = () => {
  const {
    documentId,
    elements = {},
    locks = {},
    mySocketId,
    createElement,
    updateElement,
    deleteElement,
    requestLock,
    releaseLock,
    messages,
    sendMessage,
  } = useRoom();

  const { token } = useAuth();
  const { toolState, setTool } = useTool();
  const { activeTool, activeColor, brushSize: globalBrushSize, shapeFilled, selectedShape } = toolState;

  // local UI state
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy");

  // search/share states (kept from earlier)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [shareStatus, setShareStatus] = useState({});

  // refs
  const canvasRef = useRef(null);
  const drawingRef = useRef(null); // element being drawn (shape / brush)
  const startRef = useRef(null);
  const brushVariantRef = useRef("pencil"); // pencil, marker, highlighter

  // convenience
  const myLockedElementId = Object.keys(locks).find((id) => locks[id]?.userId === mySocketId);

  /* ---------- Window events (Toolbar integration) ---------- */
  useEffect(() => {
    // import images (Toolbar dispatches "importImage")
    const handleImportEvent = (e) => {
      const { src } = e.detail || {};
      if (src) importImage(src);
    };
    window.addEventListener("importImage", handleImportEvent);

    // listen for brush variant changes (Toolbar can dispatch "setBrushVariant")
    const handleBrushVariantChange = (e) => {
      brushVariantRef.current = e.detail?.variant || "pencil";
    };
    window.addEventListener("setBrushVariant", handleBrushVariantChange);

    // allow toolbar to request exports via window.dispatchEvent(new CustomEvent('requestExport', { detail: { type: 'png' } }))
    const handleRequestExport = (e) => {
      const type = e.detail?.type || "png";
      if (type === "pdf") exportPDF();
      else if (type === "svg") exportSVG();
      else exportPNG();
    };
    window.addEventListener("requestExport", handleRequestExport);

    return () => {
      window.removeEventListener("importImage", handleImportEvent);
      window.removeEventListener("setBrushVariant", handleBrushVariantChange);
      window.removeEventListener("requestExport", handleRequestExport);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  /* ---------- Import image ---------- */
  const importImage = (src) => {
    const id = uuidv4();
    const newImage = {
      id,
      type: "image",
      src,
      x: 100,
      y: 80,
      width: 320,
      height: 200,
      zIndex: 1,
    };
    createElement(newImage);
    requestLock(id);
    setSelectedIds([id]);
  };

  /* ---------- Export helpers ---------- */
  const exportPNG = async () => {
    const node = document.getElementById("whiteboard-canvas") || canvasRef.current;
    if (!node) return alert("Canvas not found");
    const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "whiteboard.png";
    link.click();
  };

  const exportPDF = async () => {
    const node = document.getElementById("whiteboard-canvas") || canvasRef.current;
    if (!node) return alert("Canvas not found");
    const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const ratio = pageWidth / canvas.width;
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("whiteboard.pdf");
  };

  const exportSVG = () => {
    // Build an SVG containing images, basic shapes, text, and brush paths.
    const svgParts = [];
    Object.values(elements || {}).forEach((el) => {
      if (!el) return;
      if (el.type === "image") {
        svgParts.push(
          `<image href="${el.src}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" />`
        );
      } else if (el.type === "brush_stroke" && el.points) {
        const d = getSvgPathFromStroke(el.points);
        svgParts.push(
          `<path d="${d}" stroke="${el.fill || el.stroke || "#000"}" stroke-width="${el.brushSize || 4}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`
        );
      } else if (el.type === "text" || el.type === "sticky_note") {
        svgParts.push(
          `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.backgroundColor || "transparent"}" stroke="${el.stroke || "none"}" />`
        );
        const text = (el.content || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        svgParts.push(
          `<text x="${el.x + 8}" y="${el.y + 20}" font-family="${el.fontFamily || "Arial"}" font-size="${el.fontSize || 16}" fill="${el.fill || "#000"}">${text}</text>`
        );
      } else if (["rectangle", "circle", "triangle", "polygon", "pentagon", "hexagon", "diamond", "star"].includes(el.type)) {
        // fallback to rect for now
        svgParts.push(
          `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.shapeFilled ? el.fill : "transparent"}" stroke="${el.stroke || "#000"}"/>`
        );
      }
    });

    const w = canvasRef.current?.clientWidth || 1200;
    const h = canvasRef.current?.clientHeight || 800;
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${svgParts.join("")}</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "whiteboard.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Undo/Redo / Save / Load ---------- */
  const snapshot = () => JSON.parse(JSON.stringify(elements || {}));
  const pushToUndo = () => {
    setUndoStack((prev) => {
      const next = [...prev, snapshot()];
      return next.length > 50 ? next.slice(next.length - 50) : next;
    });
    setRedoStack([]);
  };

  const restoreElements = (targetState) => {
    // remove elements not present in target
    const currentIds = new Set(Object.keys(elements || {}));
    const targetIds = new Set(Object.keys(targetState || {}));
    currentIds.forEach((id) => {
      if (!targetIds.has(id)) deleteElement(id);
    });

    // upsert target elements
    Object.values(targetState || {}).forEach((el) => {
      if (elements[el.id]) updateElement(el.id, el);
      else createElement(el);
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((r) => [...r, snapshot()]);
    restoreElements(last);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((s) => [...s, snapshot()]);
    restoreElements(next);
  };

  const saveBoard = () => {
    try {
      localStorage.setItem(`whiteboard-${documentId}`, JSON.stringify(elements || {}));
      alert("✅ Board saved to localStorage");
    } catch (err) {
      console.error("saveBoard error:", err);
      alert("❌ Save failed");
    }
  };

  const loadBoard = () => {
    try {
      const raw = localStorage.getItem(`whiteboard-${documentId}`);
      if (!raw) {
        alert("⚠️ No saved board found for this document.");
        return;
      }
      const state = JSON.parse(raw);
      setUndoStack((s) => [...s, snapshot()]);
      setRedoStack([]);
      restoreElements(state);
      alert("📂 Board loaded");
    } catch (err) {
      console.error("loadBoard error:", err);
      alert("❌ Load failed");
    }
  };

  /* ---------- Geometry / hit testing ---------- */
  const getCanvasCoordinates = (e) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getElementsUnderCursor = (coords) => {
    return Object.values(elements || {})
      .filter((el) => {
        if (!el) return false;
        if (el.type === "brush_stroke" && el.points) {
          return el.points.some((p) => Math.hypot(p.x - coords.x, p.y - coords.y) <= (el.brushSize || 6));
        }
        return coords.x >= (el.x || 0) && coords.x <= (el.x || 0) + (el.width || 0) && coords.y >= (el.y || 0) && coords.y <= (el.y || 0) + (el.height || 0);
      })
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)); // topmost last
  };

  /* ---------- Mouse / drawing handlers ---------- */
  const handleMouseDown = (e) => {
    pushToUndo();
    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    startRef.current = coords;

    if (e.target === canvasRef.current) {
      if (myLockedElementId) releaseLock(myLockedElementId);
      setSelectedIds([]);
    }

    // Eraser start
    if (activeTool === "eraser") {
      setIsDrawing(true);
      const hit = getElementsUnderCursor(coords)[0];
      if (hit) {
        if (locks[hit.id]?.userId === mySocketId) releaseLock(hit.id);
        deleteElement(hit.id);
      }
      return;
    }

    // Shapes / text / sticky: create placeholder and let user drag to size
    if (["shape", "sticky_note", "text"].includes(activeTool)) {
      const id = uuidv4();
      const elType = activeTool === "shape" ? selectedShape : activeTool;
      const base = {
        id,
        type: elType,
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        fill: elType === "text" || elType === "sticky_note" ? "#000" : activeColor,
        stroke: activeColor,
        shapeFilled,
        fontSize: 16,
        content: elType === "sticky_note" ? "Sticky Note" : elType === "text" ? "Text" : "",
        backgroundColor: elType === "sticky_note" ? "#FFF9C4" : "transparent",
        zIndex: 1,
      };
      drawingRef.current = base;
      createElement(base);
      setIsDrawing(true);
      requestLock(id);
      setSelectedIds([id]);
      return;
    }

    // Brush start
    if (activeTool === "brush") {
      const id = uuidv4();
      const variant = brushVariantRef.current || "pencil";
      let size = globalBrushSize || 4;
      let opacity = 1;
      let color = activeColor || "#000";

      if (variant === "marker") {
        size = Math.max(6, (globalBrushSize || 4) * 1.6);
        opacity = 0.55;
        color = hexToRgba(activeColor, opacity);
      } else if (variant === "highlighter") {
        size = Math.max(8, (globalBrushSize || 4) * 1.5);
        opacity = 0.35;
        color = hexToRgba(activeColor, opacity);
      } else if (variant === "pencil") {
        size = Math.max(2, (globalBrushSize || 4) * 0.8);
        opacity = 1;
        color = activeColor;
      }

      const newBrushStroke = {
        id,
        type: "brush_stroke",
        points: [{ x: coords.x, y: coords.y }],
        fill: color,
        stroke: color,
        brushSize: size,
        opacity,
        x: coords.x,
        y: coords.y,
        width: size * 2,
        height: size * 2,
        zIndex: 1,
      };
      drawingRef.current = newBrushStroke;
      createElement(newBrushStroke);
      setIsDrawing(true);
      return;
    }

    // default selection / other tools: nothing special
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoordinates(e);
    if (activeTool === "eraser" && isDrawing && coords) {
      const hit = getElementsUnderCursor(coords)[0];
      if (hit) {
        if (locks[hit.id]?.userId === mySocketId) releaseLock(hit.id);
        deleteElement(hit.id);
      }
      return;
    }

    if (!isDrawing) return;
    const current = coords;
    if (!current || !drawingRef.current) return;
    const start = startRef.current;
    const currentElement = drawingRef.current;

    // shape size update while dragging
    if (["shape", "sticky_note", "text"].includes(currentElement.type)) {
      const newX = Math.min(current.x, start.x);
      const newY = Math.min(current.y, start.y);
      const newWidth = Math.abs(current.x - start.x);
      const newHeight = Math.abs(current.y - start.y);
      const changes = { x: newX, y: newY, width: newWidth, height: newHeight };
      updateElement(currentElement.id, changes);
      drawingRef.current = { ...currentElement, ...changes };
      return;
    }

    // brush stroke: append point and update bbox
    if (currentElement.type === "brush_stroke") {
      const newPoints = [...(currentElement.points || []), { x: current.x, y: current.y }];
      const minX = Math.min(...newPoints.map((p) => p.x));
      const minY = Math.min(...newPoints.map((p) => p.y));
      const maxX = Math.max(...newPoints.map((p) => p.x));
      const maxY = Math.max(...newPoints.map((p) => p.y));
      const changes = {
        points: newPoints,
        x: minX,
        y: minY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
      };
      updateElement(currentElement.id, changes);
      drawingRef.current = { ...currentElement, ...changes, points: newPoints };
    }
  };

  const handleMouseUp = () => {
    if (["shape", "sticky_note", "text", "brush", "eraser"].includes(activeTool)) {
      if (activeTool !== "eraser") setTool("select");
    }

    // If shape/text was created but size is tiny (tap), give sensible defaults
    if (drawingRef.current && ["text", "sticky_note", "rectangle", "circle", "triangle"].includes(drawingRef.current.type)) {
      const el = drawingRef.current;
      if ((el.width || 0) < 6) el.width = 120;
      if ((el.height || 0) < 6) el.height = 60;
      updateElement(el.id, { width: el.width, height: el.height });
    }

    setIsDrawing(false);
    startRef.current = null;
    drawingRef.current = null;
  };

  /* ---------- Element event handlers ---------- */
  const onElementClick = (e, element) => {
    e.stopPropagation();
    if (!element) return;
    if (activeTool !== "select") return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    const elementsUnderCursor = getElementsUnderCursor(coords);

    if (e.ctrlKey) {
      const currentIndex = elementsUnderCursor.findIndex((el) => selectedIds.includes(el.id));
      let nextElement;
      if (currentIndex === -1 || currentIndex === elementsUnderCursor.length - 1) nextElement = elementsUnderCursor[0];
      else nextElement = elementsUnderCursor[currentIndex + 1];
      if (nextElement) {
        setSelectedIds([nextElement.id]);
        requestLock(nextElement.id);
      }
      return;
    }

    // release other locks owned by me
    selectedIds
      .filter((id) => id !== element.id)
      .forEach((id) => {
        if (locks[id]?.userId === mySocketId) releaseLock(id);
      });

    requestLock(element.id);
    setSelectedIds([element.id]);
  };

  const onElementDrag = (e, d, elementId) => updateElement(elementId, { x: d.x, y: d.y });
  const onElementDragStop = (e, d, elementId) => updateElement(elementId, { x: d.x, y: d.y });
  const onElementResizeStop = (e, dir, ref, delta, pos, elementId) =>
    updateElement(elementId, { x: pos.x, y: pos.y, width: ref.offsetWidth, height: ref.offsetHeight });

  const handleDeleteElement = (id) => {
    if (locks[id]?.userId === mySocketId) releaseLock(id);
    deleteElement(id);
    setSelectedIds((p) => p.filter((i) => i !== id));
  };

  const handleCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Copy"), 2000);
    } catch {
      setCopyStatus("Failed");
      setTimeout(() => setCopyStatus("Copy"), 2000);
    }
  };

  // share with user (kept)
  const handleShareWithUser = async (email) => {
    setShareStatus((prev) => ({ ...prev, [email]: "Sharing..." }));
    try {
      const res = await fetch(`http://localhost:3001/api/documents/${documentId}/access`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to share");
      setShareStatus((prev) => ({ ...prev, [email]: "Shared!" }));
    } catch (err) {
      console.error(err);
      setShareStatus((prev) => ({ ...prev, [email]: "Error!" }));
    }
  };

  // debounced search (kept)
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3001/api/users/search?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [token]
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);
    debouncedSearch(query);
  };

  const isLockedByMe = (id) => locks[id]?.userId === mySocketId;

  /* ---------- Render ---------- */
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Toolbar: it uses window events for import/export/variant; keep toolbar on top */}
      <Toolbar />

      <div
        style={{
          width: "100%",
          height: "100%",
          paddingRight: isChatOpen ? "320px" : "0px",
          boxSizing: "border-box",
          transition: "padding-right 0.22s ease",
        }}
      >
        <div
          ref={canvasRef}
          id="whiteboard-canvas"
          style={{
            width: "100%",
            height: "100%",
            background: "#f6f7fb",
            cursor: activeTool === "brush" ? "crosshair" : activeTool === "eraser" ? "cell" : "default",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {Object.values(elements || {}).map((el) =>
            el?.type === "brush_stroke" ? (
              <BrushStrokeRenderer key={el.id} element={el} />
            ) : (
              <WhiteboardElement
                key={el.id}
                element={el}
                lockInfo={locks[el.id] || null}
                isLocked={!!locks[el.id] && locks[el.id].userId !== mySocketId}
                isLockedByMe={isLockedByMe(el.id)}
                isSelected={selectedIds.includes(el.id)}
                onElementClick={onElementClick}
                onDrag={onElementDrag}
                onDragStop={onElementDragStop}
                onResizeStop={onElementResizeStop}
                updateElement={updateElement}
                deleteElement={handleDeleteElement}
                isEraserActive={activeTool === "eraser"}
                isDrawing={isDrawing}
              />
            )
          )}
        </div>

        {/* bottom toolbar */}
        <div style={bottomToolbarStyle}>
          <button style={btnStyle} onClick={handleUndo}>
            ↩️ Undo
          </button>
          <button style={btnStyle} onClick={handleRedo}>
            ↪️ Redo
          </button>
          <button style={btnStyle} onClick={saveBoard}>
            💾 Save
          </button>
          <button style={btnStyle} onClick={loadBoard}>
            📂 Load
          </button>

          <button
            style={btnStyle}
            onClick={() => {
              setShowShareModal(true);
            }}
          >
            🔗 Share
          </button>

          <button
            style={btnStyle}
            onClick={() => {
              setIsChatOpen((s) => !s);
            }}
            title="Toggle chat"
          >
            💬 {isChatOpen ? "Hide Chat" : "Open Chat"}
          </button>
        </div>

        {/* Share modal */}
        {showShareModal && (
          <div
            style={modalOverlayStyle}
            onClick={() => {
              setShowShareModal(false);
              setCopyStatus("Copy");
              setSearchQuery("");
              setSearchResults([]);
              setShareStatus({});
            }}
          >
            <div onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
              <h3>Share this board</h3>

              <p style={{ marginTop: 0, marginBottom: 5, fontSize: 14 }}>Copy and share the link:</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input type="text" value={`${window.location.origin}/whiteboard/${documentId}`} readOnly style={modalInputStyle} />
                <button onClick={() => handleCopy(`${window.location.origin}/whiteboard/${documentId}`)} style={btnStyle}>
                  {copyStatus === "Copy" ? "Copy Link" : copyStatus}
                </button>
              </div>

              <p style={{ marginTop: 0, marginBottom: 5, fontSize: 14 }}>Or copy the Room Code:</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input type="text" value={documentId} readOnly style={modalInputStyle} />
                <button onClick={() => handleCopy(documentId)} style={btnStyle}>
                  {copyStatus === "Copy" ? "Copy Code" : copyStatus}
                </button>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "12px 0" }} />

              <p style={{ marginTop: 0, marginBottom: 5, fontSize: 14 }}>Or share with users in your database:</p>
              <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Search by name or email..." style={{ ...modalInputStyle, width: "100%", boxSizing: "border-box" }} />

              <div style={{ maxHeight: 150, overflowY: "auto", marginTop: 10 }}>
                {isSearching && <p style={searchResultTextStyle}>Searching...</p>}
                {!isSearching && searchResults.length === 0 && searchQuery.length > 1 && <p style={searchResultTextStyle}>No users found.</p>}
                {!isSearching &&
                  searchResults.map((user) => (
                    <div key={user._id} style={searchResultRowStyle}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>{user.email}</div>
                      </div>
                      <button style={btnStyle} onClick={() => handleShareWithUser(user.email)} disabled={shareStatus[user.email] && shareStatus[user.email] !== "Error!"}>
                        {shareStatus[user.email] || "Share"}
                      </button>
                    </div>
                  ))}
              </div>

              <div style={{ marginTop: 20, textAlign: "right" }}>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setCopyStatus("Copy");
                    setSearchQuery("");
                    setSearchResults([]);
                    setShareStatus({});
                  }}
                  style={{ ...btnStyle, background: "#e6e6e6", color: "#111" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat sidebar */}
      <ChatSidebar messages={messages} onSendMessage={sendMessage} isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />

      {!isChatOpen && (
        <button style={openChatBtnStyle} onClick={() => setIsChatOpen(true)} title="Open Chat">
          💬
        </button>
      )}
    </div>
  );
};

/* ---------- Styles ---------- */
const btnStyle = {
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: "14px",
};

const bottomToolbarStyle = {
  position: "fixed",
  bottom: 20,
  left: 20,
  display: "flex",
  gap: "10px",
  background: "rgba(255,255,255,0.92)",
  padding: "10px 14px",
  borderRadius: "12px",
  boxShadow: "0 8px 30px rgba(2,6,23,0.08)",
  zIndex: 10000,
};

const openChatBtnStyle = {
  ...btnStyle,
  position: "fixed",
  top: "80px",
  right: "20px",
  zIndex: 10000,
  padding: "10px 12px",
  fontSize: "18px",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 20000,
};

const modalContentStyle = {
  background: "#fff",
  borderRadius: 12,
  padding: 24,
  width: 420,
  boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
};

const modalInputStyle = {
  flex: 1,
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: "8px",
};

const searchResultRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px",
  borderBottom: "1px solid #eee",
};

const searchResultTextStyle = {
  padding: "8px",
  color: "#777",
  textAlign: "center",
};

export default Whiteboard;
