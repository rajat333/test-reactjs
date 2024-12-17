const MongoService = require('../services/mongoService');
const { formatResponse } = require('../utils/responseFormatter');
const { handleAsyncError } = require('../utils/errorHandler');

const mockData = {
    databases: ['SalesDB', 'InventoryDB', 'HRDB'],
    tables: {
        SalesDB: ['Orders', 'Customers', 'Products'],
        InventoryDB: ['Items', 'Suppliers', 'Inventory'],
        HRDB: ['Employees', 'Payroll', 'Departments']
    },
    columns: {
        Orders: ['OrderID', 'CustomerID', 'ProductID', 'Quantity'],
        Customers: ['CustomerID', 'CustomerName', 'ContactName', 'Country'],
        Products: ['ProductID', 'ProductName', 'Category', 'Price'],
        Items: ['ItemID', 'ItemName', 'Category', 'StockQuantity'],
        Suppliers: ['SupplierID', 'SupplierName', 'ContactName'],
        Inventory: ['InventoryID', 'ItemID', 'QuantityInStock'],
        Employees: ['EmployeeID', 'EmployeeName', 'Position', 'Salary'],
        Payroll: ['EmployeeID', 'SalaryAmount', 'Bonus'],
        Departments: ['DepartmentID', 'DepartmentName'],
    }
};

class DatabaseController {
    constructor() {
        this.mongoService = new MongoService();
    }

    getDatabaseStructure = handleAsyncError(async (req, res) => {
        try {
            const dbStructure = await this.mongoService.getDatabaseStructure();
            const response = formatResponse(dbStructure);
            res.status(200).json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}

module.exports = new DatabaseController();
