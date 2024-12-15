function formatResponse(dbStructure) {
    return {
      databases: dbStructure.databases,
      tables: dbStructure.tables,
      columns: dbStructure.columns,
    };
  }
  
  module.exports = { formatResponse };
  