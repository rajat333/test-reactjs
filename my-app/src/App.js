import React, { useEffect, useState } from 'react';

import "./App.css";
import { AppContainer, ListItem, Text } from './App.style';
import TextInputWithChips from './TextInputWithChips';

function App() {
  const [dbData, setDbData] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch('/api/databases'); // No need to specify the full URL
        const data = await response.json();
        setDbData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (!dbData.length)  getData();
  },[]);

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  const handleDatabaseSelection = (database) => {
    setSelectedDatabase(database);
    setInputValue(`@${database} `);
  };

  const handleTableSelection = (table) => {
    setSelectedTable(table);
    setInputValue(`@${selectedDatabase} #${table ? table : ""} `);
  };

  const handleColumnSelection = (columns) => {
    setSelectedColumns((prev) => {
      // Ensure columns is always treated as an array
      // const columnArray = Array.isArray(columns) ? columns : [columns];

      // let updatedColumns = [...prev];

      // columnArray.forEach((col) => {
      //   if (updatedColumns.includes(col)) {
      //     // Remove column if it already exists
      //     updatedColumns = updatedColumns.filter((item) => item !== col);
      //   } else {
      //     // Add column if not present
      //     updatedColumns.push(col);
      //   }
      // });
      // console.log("updatedColumns----", updatedColumns);
      console.log("columns---", columns);
      return columns;
    });
  };

  return (
    <div className="App"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}
    >
      <h1>Database, Table & Column Selector</h1>
      <TextInputWithChips
        value={inputValue}
        onChange={handleInputChange}
        databases={dbData.databases}
        tables={dbData.tables}
        columns={dbData.columns}
        selectedDatabase={selectedDatabase}
        selectedTable={selectedTable}
        onDatabaseSelect={handleDatabaseSelection}
        onTableSelect={handleTableSelection}
        onColumnSelect={handleColumnSelection}
        selectedColumns={selectedColumns}
      />
      <AppContainer>
        <h2>Final Output</h2>
        <ListItem>
          <h4>Database:</h4>
          <Text> {selectedDatabase}</Text>
        </ListItem>
        <ListItem>
          <h4>Table:</h4>
          <Text> {selectedTable}</Text>
        </ListItem>
        <ListItem>
          <h4>Columns:</h4>
          <Text> {selectedColumns.join(', ')}</Text>
        </ListItem>

      </AppContainer>
    </div>
  );
}

export default App;
