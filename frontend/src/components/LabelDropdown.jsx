import React, { useState } from "react";

function LabelDropdown({ onSelect }) {
  const [labels] = useState(["Label 1", "Label 2", "Label 3"]);

  return (
    <select
      className="label-dropdown"
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Label</option>
      {labels.map((label, index) => (
        <option key={index} value={label}>
          {label}
        </option>
      ))}
    </select>
  );
}

export default LabelDropdown;
