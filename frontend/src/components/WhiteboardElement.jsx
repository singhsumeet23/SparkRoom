import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";

const shapeStyles = {
  rectangle: { borderRadius: 0 },
  square: { borderRadius: 0 },
  circle: { borderRadius: "50%" },
  triangle: {}, // handled separately in svg
};

const FONT_FAMILIES = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Georgia",
  "Comic Sans MS",
];

const WhiteboardElement = ({
  element,
  isLocked,
  isLockedByMe,
  isSelected,
  lockInfo,
  onElementClick,
  onDrag,
  onDragStop,
  onResizeStop,
  updateElement,
  deleteElement,
  isEraserActive,
  isDrawing,
}) => {
  const {
    id,
    type,
    x = 0,
    y = 0,
    width = 100,
    height = 60,
    fill = "#000",
    stroke = "#000",
    shapeFilled,
    content,
    backgroundColor = "transparent",
    fontSize = 16,
    fontFamily = "Arial",
    fontWeight = "normal",
    fontStyle = "normal",
    textDecoration = "none",
    textAlign = "center",
    highlightColor = "transparent",
    src,
    opacity = 1,

    // 🔥 NEW shape properties
    borderWidth = 2,
    fillOpacity = 1,
    useGradient = false,
    gradientColor = "#00b4d8",
  } = element;

  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(content || "");
  const [showTextToolbar, setShowTextToolbar] = useState(false);
  const toolbarRef = useRef(null);

  useEffect(() => {
    if (isSelected && (type === "text" || type === "sticky_note"))
      setShowTextToolbar(true);
    else setShowTextToolbar(false);
  }, [isSelected, type]);

  const handleStyleChange = (prop, value) => updateElement(id, { [prop]: value });

  const toggleStyle = (prop) => {
    const current = element[prop];
    let toggled;
    switch (prop) {
      case "fontWeight":
        toggled = current === "bold" ? "normal" : "bold";
        break;
      case "fontStyle":
        toggled = current === "italic" ? "normal" : "italic";
        break;
      case "textDecoration":
        toggled = current === "underline" ? "none" : "underline";
        break;
      default:
        toggled = current;
    }
    updateElement(id, { [prop]: toggled });
  };

  const renderShape = () => {
    // 🖼️ IMAGE
    if (type === "image" && src) {
      return (
        <img
          src={src}
          alt="Imported"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: 6,
            display: "block",
            backgroundColor: "#fff",
            pointerEvents: "none",
            opacity,
          }}
          draggable={false}
        />
      );
    }

    // ✍️ TEXT or STICKY NOTE
    if (type === "text" || type === "sticky_note") {
      if (isEditing) {
        return (
          <textarea
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              updateElement(id, { content: tempText });
            }}
            autoFocus
            style={{
              width: "100%",
              height: "100%",
              background:
                type === "sticky_note" ? backgroundColor : "transparent",
              color: fill || "#000",
              fontSize,
              fontFamily,
              fontWeight,
              fontStyle,
              textDecoration,
              textAlign,
              border: "1px solid #ddd",
              outline: "none",
              resize: "none",
              padding: 8,
              boxSizing: "border-box",
              backgroundColor:
                highlightColor ||
                (type === "sticky_note" ? backgroundColor : "transparent"),
            }}
          />
        );
      }

      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              type === "sticky_note"
                ? backgroundColor
                : highlightColor || "transparent",
            color: fill || "#000",
            fontSize,
            fontFamily,
            fontWeight,
            fontStyle,
            textDecoration,
            textAlign,
            display: "flex",
            alignItems: "center",
            justifyContent:
              type === "sticky_note" ? "flex-start" : "center",
            padding: 8,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            cursor: "text",
            borderRadius: type === "sticky_note" ? 8 : 0,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {content ||
            (type === "sticky_note" ? "Sticky Note" : "Text")}
        </div>
      );
    }

    // 🔺 POLYGONS & CUSTOM SHAPES
    if (
      [
        "triangle",
        "pentagon",
        "hexagon",
        "diamond",
        "star",
        "polygon",
      ].includes(type)
    ) {
      let points = "";
      switch (type) {
        case "triangle":
          points = `${width / 2},0 0,${height} ${width},${height}`;
          break;
        case "pentagon":
          points = `${width / 2},0 ${width},${height * 0.38} ${
            width * 0.81
          },${height} ${width * 0.19},${height} 0,${height * 0.38}`;
          break;
        case "hexagon":
          points = `${width * 0.25},0 ${width * 0.75},0 ${width},${
            height / 2
          } ${width * 0.75},${height} ${width * 0.25},${height} 0,${
            height / 2
          }`;
          break;
        case "diamond":
          points = `${width / 2},0 ${width},${height / 2} ${
            width / 2
          },${height} 0,${height / 2}`;
          break;
        case "star":
          points =
            "50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35";
          break;
        case "polygon":
          points = `${width * 0.2},0 ${width * 0.8},0 ${width},${
            height * 0.4
          } ${width * 0.8},${height} ${width * 0.2},${height} 0,${
            height * 0.4
          }`;
          break;
        default:
          points = "";
      }

      return (
        <svg
          width="100%"
          height="100%"
          style={{ pointerEvents: "none", overflow: "visible" }}
        >
          <defs>
            {useGradient && (
              <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={fill} stopOpacity={fillOpacity} />
                <stop
                  offset="100%"
                  stopColor={gradientColor}
                  stopOpacity={fillOpacity}
                />
              </linearGradient>
            )}
          </defs>
          <polygon
            points={points}
            fill={
              shapeFilled
                ? useGradient
                  ? `url(#grad-${id})`
                  : fill
                : "transparent"
            }
            stroke={stroke}
            strokeWidth={borderWidth}
            style={{ opacity }}
          />
        </svg>
      );
    }

    // 🟦 BASIC SHAPES
    const shapeBackground = useGradient
      ? `linear-gradient(135deg, ${fill} 0%, ${gradientColor} 100%)`
      : shapeFilled
      ? fill
      : "transparent";

    const style = {
      width: "100%",
      height: "100%",
      background: shapeBackground,
      border: `${borderWidth}px solid ${stroke}`,
      pointerEvents: "none",
      ...shapeStyles[type],
      opacity: fillOpacity,
    };

    return <div style={style} />;
  };

  return (
    <>
      <Rnd
        size={{ width, height }}
        position={{ x, y }}
        bounds="parent"
        disableDragging={isLocked && !isLockedByMe}
        enableResizing={!isLocked || isLockedByMe}
        onDrag={(e, d) => onDrag(e, d, id)}
        onDragStop={(e, d) => onDragStop(e, d, id)}
        onResizeStop={(e, dir, ref, delta, pos) =>
          onResizeStop(e, dir, ref, delta, pos, id)
        }
        onClick={(e) => onElementClick(e, element)}
        onDoubleClick={(e) => {
          if (type === "text" || type === "sticky_note") {
            e.stopPropagation();
            setIsEditing(true);
          }
          if (type === "image") {
            e.stopPropagation();
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (ev) => {
              const file = ev.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                  updateElement(id, { src: evt.target.result });
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }
        }}
        onMouseEnter={() => {
          if (isEraserActive && isDrawing) {
            deleteElement(id);
          }
        }}
        style={{
          position: "absolute",
          border: isSelected
            ? "2px solid #3b82f6"
            : isLocked
            ? "2px dotted red"
            : "none",
          boxSizing: "border-box",
          cursor:
            isLocked && !isLockedByMe
              ? "not-allowed"
              : type === "text" || type === "sticky_note"
              ? "text"
              : "move",
          zIndex: isSelected ? 1000 : 1,
          background: "transparent",
        }}
      >
        {renderShape()}

        {/* 🔒 Lock info */}
        {isLocked && !isLockedByMe && lockInfo && (
          <div
            style={{
              ...lockInfoStyle,
              left: 0,
              top: -20,
            }}
          >
            {`Locked by ${lockInfo.userName || lockInfo.userId}`}
          </div>
        )}

        {/* ❌ Delete button */}
        {isSelected && (!isLocked || isLockedByMe) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteElement(id);
            }}
            style={deleteBtnStyle}
          >
            ×
          </button>
        )}
      </Rnd>

      {/* 🧰 Floating text toolbar */}
      {showTextToolbar && (type === "text" || type === "sticky_note") && (
        <div
          ref={toolbarRef}
          style={{
            position: "absolute",
            top: Math.max(8, y - 56),
            left: x,
            background: "rgba(255,255,255,0.98)",
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            padding: 8,
            display: "flex",
            gap: 6,
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <select
            value={fontFamily}
            onChange={(e) =>
              handleStyleChange("fontFamily", e.target.value)
            }
            style={{ padding: 4 }}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) =>
              handleStyleChange("fontSize", Number(e.target.value))
            }
            style={{ width: 56 }}
          />

          <button
            onClick={() => toggleStyle("fontWeight")}
            style={{
              fontWeight: "bold",
              background:
                fontWeight === "bold" ? "#e0e7ff" : "#fff",
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            B
          </button>
          <button
            onClick={() => toggleStyle("fontStyle")}
            style={{
              fontStyle: "italic",
              background:
                fontStyle === "italic" ? "#e0e7ff" : "#fff",
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            I
          </button>
          <button
            onClick={() => toggleStyle("textDecoration")}
            style={{
              textDecoration: "underline",
              background:
                textDecoration === "underline" ? "#e0e7ff" : "#fff",
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            U
          </button>

          {["left", "center", "right", "justify"].map((align) => (
            <button
              key={align}
              onClick={() => handleStyleChange("textAlign", align)}
              style={{
                background:
                  textAlign === align ? "#e0e7ff" : "#fff",
                borderRadius: 4,
                padding: "2px 6px",
              }}
            >
              {align.charAt(0).toUpperCase()}
            </button>
          ))}

          <input
            type="color"
            value={fill}
            onChange={(e) => handleStyleChange("fill", e.target.value)}
          />
          <input
            type="color"
            value={highlightColor || "#ffffff"}
            onChange={(e) =>
              handleStyleChange("highlightColor", e.target.value)
            }
          />
        </div>
      )}
    </>
  );
};

/* ---------- styles ---------- */
const lockInfoStyle = {
  position: "absolute",
  top: -18,
  left: 0,
  background: "red",
  color: "#fff",
  fontSize: 11,
  padding: "2px 6px",
  borderRadius: 6,
  pointerEvents: "none",
  whiteSpace: "nowrap",
  zIndex: 4000,
};

const deleteBtnStyle = {
  position: "absolute",
  top: -10,
  right: -10,
  background: "red",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: 22,
  height: 22,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

export default WhiteboardElement;
