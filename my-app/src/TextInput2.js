import React, { useState, useEffect, useRef } from "react";

const TextAreaWithEntities = ({
  value,
  onChange,
  databases,
  tables,
  columns,
  selectedDatabase,
  selectedTable,
  onDatabaseSelect,
  onTableSelect,
  onColumnSelect,
  selectedColumns,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [inputStage, setInputStage] = useState(null); // Tracks '@', '#', or '$'
  const [freeText, setFreeText] = useState(value || ""); // Tracks free text
  const [showSuggestions, setShowSuggestions] = useState(false);

  const containerRef = useRef(null);

  // Outside click handler to close suggestions
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Detect input stage and handle symbol triggers
  useEffect(() => {
    const match = value.match(/[@#$]/g);
    if (match) {
      const lastSymbol = match[match.length - 1];
      if (lastSymbol === "@" && !selectedDatabase) setInputStage("database");
      else if (lastSymbol === "#" && selectedDatabase && !selectedTable)
        setInputStage("table");
      else if (lastSymbol === "$" && selectedTable) setInputStage("column");
      setShowSuggestions(true);
    } else {
      setInputStage(null);
      setShowSuggestions(false);
    }
  }, [value, selectedDatabase, selectedTable]);

  // Update suggestions dynamically based on inputStage
  useEffect(() => {
    console.log("useEffect value----", value, inputStage);
    if (inputStage === "database") {
      console.log("in database");
      const query = value.split("@").pop().trim();
      setSuggestions(
        databases.filter((db) =>
          db.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else if (inputStage === "table" && selectedDatabase) {
      const query = value.split("#").pop().trim();
      setSuggestions(
        tables[selectedDatabase]?.filter((table) =>
          table.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else if (inputStage === "column" && selectedTable) {
      const query = value.split("$").pop().trim();
      setSuggestions(
        columns[selectedTable]?.filter((col) =>
          col.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      console.log("in else", inputStage, value);
      setSuggestions([]);
      // setInputStage(null);
    }
  }, [inputStage, value, databases, tables, columns, selectedDatabase, selectedTable]);

  // Free text input handler
  const handleFreeTextChange = (inputValue) => {
    setFreeText(inputValue); // Keep free text state updated
    if (!/@|#|\$/.test(inputValue)) {
      onChange(inputValue); // Update the external value with free text
    } else {
      onChange(inputValue); // Mixed case: free text + symbols
    }
  };

  // Handle selection from suggestions
  const handleSelection = (selection) => {
    console.log("handleSelection----", selection);
    if (inputStage === "database") {
      onDatabaseSelect(selection);
      console.log("Input update---", `${freeText}${selection}`);
      const updateSelection = selection.replace("@", '');
      onChange(`${freeText}${updateSelection} `);
      setShowSuggestions(false);
      setInputStage(null);
    } else if (inputStage === "table") {
      onTableSelect(selection);
      const updateSelection = selection.replace("#", '');
      onChange(`${freeText}${selectedDatabase} ${updateSelection} `);
      setShowSuggestions(false);
      setInputStage(null);
    } else if (inputStage === "column") {
      const updatedColumns = selectedColumns.includes(selection)
        ? selectedColumns.filter((col) => col !== selection)
        : [...selectedColumns, selection];
      onColumnSelect(updatedColumns);
      onChange(
        `${freeText}${selectedDatabase} ${selectedTable} ${updatedColumns.join(
          ","
        )} `
      );
    }
    // setShowSuggestions(false);
  };

  // Remove selected chips
  const removeChip = (type, selection) => {
    console.log("removeChip-----", type, selection);
    if (type === "database") {
      onDatabaseSelect(null);
      onTableSelect(null);
      onColumnSelect(null);
    } else if (type === "table") {
      onTableSelect(null);
    } else if (type === "column") {
      const updatedColumns = selectedColumns.filter((col) => col !== selection);
      onColumnSelect(updatedColumns);
    }
  };

  // Render suggestions dynamically
  const renderSuggestions = () => {
    console.log("suggestions-----", suggestions, showSuggestions);
    if (!showSuggestions || suggestions.length === 0) return null;
    return (
      <ul style={suggestionsListStyle}>
        {suggestions.map((s, idx) => (
          <li
            key={idx}
            style={suggestionItemStyle(inputStage === "column" && selectedColumns.includes(s))}
            onClick={() => handleSelection(s)}
          >
            {inputStage === "column" ? (
              <input
                type="checkbox"
                checked={selectedColumns.includes(s)}
                onChange={() => handleSelection(s)}
                style={{ marginRight: "8px" }}
              />
            ) : null}
            {s}
          </li>
        ))}
      </ul>
    );
  };

  // Render chips
  const renderChips = () => {
    const chips = [];
    if (selectedDatabase) {
      chips.push({ type: "database", value: selectedDatabase, color: "blue" });
    }
    if (selectedTable) {
      chips.push({ type: "table", value: selectedTable, color: "green" });
    }
    selectedColumns.forEach((col) => {
      chips.push({ type: "column", value: col, color: "orange" });
    });
    return (
      <div style={chipsContainerStyle}>
        {chips.map((chip, idx) => (
          <span
            key={idx}
            style={{ ...chipStyle, backgroundColor: chip.color }}
          >
            {chip.value}
            <button
              onClick={() => removeChip(chip.type, chip.value)}
              style={removeButtonStyle}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    );
  };

  // Styling
  const chipsContainerStyle = {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    flexWrap: "wrap",
  };

  const chipStyle = {
    padding: "4px 8px",
    borderRadius: "16px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const removeButtonStyle = {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  };

  const suggestionsListStyle = {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    backgroundColor: "#fff",
    listStyle: "none",
    border: "1px solid #ddd",
    zIndex: 10,
    padding: 0,
    margin: 0,
  };

  const suggestionItemStyle = (isSelected) => ({
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: isSelected ? "#f0f0f0" : "#fff",
  });

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {renderChips()}
      <textarea
        value={value}
        onChange={(e) => handleFreeTextChange(e.target.value)}
        placeholder="Start typing with @ for database, # for table, $ for columns..."
        style={{ width: "100%", minHeight: "80px", border: "1px solid #ddd", borderRadius: "4px", padding: "8px" }}
      />
      {renderSuggestions()}
    </div>
  );
};

export default TextAreaWithEntities;
