import { useRef } from "react";

export const useHistory = (initialState = []) => {
  const history = useRef({
    undoStack: [],
    redoStack: [],
  });

  const addAction = (state) => {
    history.current.undoStack.push(JSON.stringify(state));
    history.current.redoStack = [];
  };

  const undo = () => {
    if (history.current.undoStack.length === 0) return null;
    const last = history.current.undoStack.pop();
    history.current.redoStack.push(last);
    return JSON.parse(last);
  };

  const redo = () => {
    if (history.current.redoStack.length === 0) return null;
    const next = history.current.redoStack.pop();
    history.current.undoStack.push(next);
    return JSON.parse(next);
  };

  return { addAction, undo, redo };
};
