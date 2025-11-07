export const useBoardStorage = () => {
  const saveBoard = (elements) => {
    localStorage.setItem("whiteboardData", JSON.stringify(elements));
    alert("✅ Board saved successfully!");
  };

  const loadBoard = () => {
    const data = localStorage.getItem("whiteboardData");
    if (!data) {
      alert("⚠️ No saved board found!");
      return [];
    }
    alert("📂 Board loaded!");
    return JSON.parse(data);
  };

  return { saveBoard, loadBoard };
};
