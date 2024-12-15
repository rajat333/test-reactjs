import React, { useState, useEffect, useRef } from "react";
import { StyleList } from './App.style';

const TextInputWithChips = ({
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
  const [suggestions, setSuggestions] = useState([]); // list of suggestion for table, database, column
  const [inputStage, setInputStage] = useState(null); // 'database', 'table', 'column'
  const [showSuggestions, setShowSuggestions] = useState(false);
  // const [freeTextChips, setFreeTextChips] = useState([]); // Store free text chips

  const containerRef = useRef(null);

  // Outside click handler to close suggestions
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
        // onChange("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Detect input stage based on symbols
  useEffect(() => {
    const lastSymbol = value.match(/[@#$]/g);
    if (lastSymbol) {
      const stageSymbol = lastSymbol[lastSymbol.length - 1];
      if (stageSymbol === "@" && !selectedDatabase) setInputStage("database");
      else if (stageSymbol === "#" && !selectedTable) setInputStage("table");
      else if (stageSymbol === "$") setInputStage("column");
      setShowSuggestions(true);
    } else {
      setInputStage(null);
      setShowSuggestions(false);
      // setFreeTextChips([value]);
    }
  }, [value]);

  // Update suggestions dynamically
  useEffect(() => {
    if (inputStage === "database") {
      const query = value.split("@")[1]?.trim() || "";
      setSuggestions(
        databases.filter((db) =>
          db.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else if (inputStage === "table" && selectedDatabase) {
      const query = value.split("#")[1]?.trim() || "";
      setSuggestions(
        tables[selectedDatabase]?.filter((table) =>
          table.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else if (inputStage === "column" && selectedTable) {
      const query = value.split("$")[1]?.trim() || "";
      setSuggestions(
        columns[selectedTable]
          // ?.filter((col) =>
          //   col.toLowerCase().includes(query.toLowerCase())
          // )
          .map((col) => ({
            name: col,
            selected: selectedColumns.includes(col),
          }))
      );
    } else {
      setSuggestions([]);
    }
  }, [inputStage, value, selectedDatabase, selectedTable, databases, tables, columns, selectedColumns]);

  // Handle selection from suggestions
  const handleSelection = (selection) => {
    if (inputStage === "database") {
      onDatabaseSelect(selection);
      const data = value.replace("@", ' ') + selection + " ";
      onChange(data);
      setShowSuggestions(false);
    } else if (inputStage === "table") {
      onTableSelect(selection);
      const data = value.replace("#", ' ') + selection + " ";
      onChange(data);
      setShowSuggestions(false);
    }
  };

  // Toggle column selection and ensure list reflects changes
  const toggleColumnSelection = (column) => {
    let updatedColumns;
    let updatedValue = value;
    if (selectedColumns.includes(column)) {
      updatedColumns = selectedColumns.filter((col) => col !== column);
      updatedValue = value.replace(column, "");

    } else {
      updatedColumns = [...selectedColumns, column];
      updatedValue = value.replace("$", "") + column + " $";
    }
    onColumnSelect(updatedColumns);
    onChange(updatedValue);
    // Update the suggestions list state
    setSuggestions((prev) =>
      prev.map((item) =>
        item.name === column ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // // Add free text chip
  // const addFreeTextChip = (text) => {
  //   console.log("addFreeTextChip----", text);
  //   setFreeTextChips((prev) => [...prev, text]);
  // };

  // // Remove free text chip
  // const removeFreeTextChip = (index) => {
  //   console.log("removeFreeTextChip----", index);
  //   setFreeTextChips((prev) => prev.filter((_, i) => i !== index));
  // };

  // Handle input key events (Enter or Tab to add free text chips)
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    if (!newValue.startsWith("@") && !newValue.startsWith("#") && !newValue.startsWith("$")) {
      setInputStage(null); // Reset stage for free text
      setShowSuggestions(false); // Hide suggestions
    }
    onChange(newValue); // Update the parent
  };

  // Remove a chip and update both input and suggestions
  const removeChip = (type, valueName) => {
    if (type === "database") {
      onDatabaseSelect(null); // Clear database selection
      onTableSelect(null); // Clear table selection
      onColumnSelect([]); // Clear all selected columns
      setSuggestions([]); // Reset suggestions
      const updatedValue = value.replace(valueName, "");
      onChange(updatedValue); // Reset input value
      setShowSuggestions(false);
    } else if (type === "table") {
      onTableSelect(null); // Clear table selection
      onColumnSelect([]); // Clear all columns related to the table
      setSuggestions([]); // Reset suggestions
      let updatedValue = value.replace(valueName, "");
      selectedColumns?.forEach((col) => {
        updatedValue = updatedValue.replace(col, "");
      });
      onChange(updatedValue); // Reset input value

    } else if (type === "column") {
      toggleColumnSelection(value); // Toggle specific column
      // const updatedValue = value.replace("$", "");
    }
  };

  // Render suggestions based on input stage
  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    if (inputStage === "column") {
      return (
        <StyleList
          className={`suggestions-list ${showSuggestions ? "show" : ""}`}
        // style={{ zIndex: 10 }}
        >
          {suggestions.map((s) => (
            <li
              key={s.name}
              style={suggestionItemStyle(s.selected)}
              onClick={() => toggleColumnSelection(s.name)}
            >
              <input
                type="checkbox"
                checked={s.selected}
                onChange={() => toggleColumnSelection(s.name)}
                style={{ marginRight: "8px" }}
              />
              {s.name}
            </li>
          ))}
        </StyleList>
      );
    }

    return (
      <StyleList>
        {suggestions.map((s, idx) => (
          <li
            key={idx}
            style={suggestionItemStyle(false)}
            onClick={() => handleSelection(s)}
          >
            {s}
          </li>
        ))}
      </StyleList>
    );
  };

  const suggestionItemStyle = (selected) => ({
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: selected ? "#f0f0f0" : "#fff",
  });

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          minHeight: "40px",
        }}
      >
        <div style={{ display: "flex" }}>
          {/* Chips */}
          {selectedDatabase && renderChip("database", selectedDatabase, "#4CAF50", () => removeChip("database", selectedDatabase))}
          {selectedTable && renderChip("table", selectedTable, "#346790", () => removeChip("table", selectedTable))}
          {selectedColumns.map((col) =>
            renderChip("column", col, "#FFC107", () => toggleColumnSelection(col))
          )}
        </div>
        <br />
        {/* {freeTextChips.map((chip, idx) =>
          renderChip("freeText", chip, "#9C27B0", () =>
            removeFreeTextChip(idx)
          )
        )} */}
        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          // onKeyDown={(e) => handleInputKeyDown(e)} // New event handler for key press
          placeholder="Type @, #, or $ to begin..."
          style={{ flex: "1", border: "none", outline: "none", width:"95%" }}
        />
      </div>
      {renderSuggestions()}
    </div>
  );
};

const renderChip = (type, label, color, onRemove) => (
  <div
    key={label}
    style={{
      backgroundColor: color,
      color: "#fff",
      padding: "5px 10px",
      borderRadius: "12px",
      marginRight: "8px",
      display: "flex",
      alignItems: "center",
    }}
  >
    {label}
    <span style={{ marginLeft: "8px", cursor: "pointer" }} onClick={onRemove}>
      x
    </span>
  </div>
);

export default TextInputWithChips;
