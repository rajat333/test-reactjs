const mongoose = require('mongoose');

const config = require('../config/dbConfig');

class MongoService {
    constructor() {
        this.mongoConnection = null;
        this.connectToMongoDB();
    }

    connectToMongoDB() {
        try {
            mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log("mongoUrl", config.mongoUrl);
            this.mongoConnection = mongoose.connection;

            this.mongoConnection.on('connected', () => {
                console.log('Connected to MongoDB');
            });

            this.mongoConnection.on('error', (err) => {
                console.error('Error connecting to MongoDB:', err.message);
            });
        } catch (error) {
            console.error("Error connecting to MongoDB:", error.message);
        }
    }

    async getDatabaseStructure() {
        const admin = this.mongoConnection.db.admin();
        const databases = await admin.listDatabases();
        const structure = {
            databases: [],
            tables: {},
            columns: {},
        };

        for (const db of databases.databases) {

            if (db.name === 'admin' || db.name === 'local' || db.name === 'config') {
                continue;
            }
            const dbName = db.name;
            structure.databases.push(dbName);

            const dbConnection = this.mongoConnection.useDb(dbName);
            const collections = await dbConnection.listCollections();
            structure.tables[dbName] = collections.map((col) => col.name);

            for (const collection of collections) {
                const coll = dbConnection.collection(collection.name);
                const sampleDoc = await coll.findOne();

                structure.columns[collection.name] = sampleDoc
                    ? Object.keys(sampleDoc).filter((key) => key !== '_id')
                    : [];
            }
        }
        return structure;
    }
}

module.exports = MongoService;
