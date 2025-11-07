import React from "react";

const ColorPicker = ({ value, onChange }) => {
  return <input type="color" value={value} onChange={onChange} />;
};

export default ColorPicker;
