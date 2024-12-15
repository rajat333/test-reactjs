const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

const databaseRoutes = require('./routes/databaseRoutes');

app.use(express.static(path.join(__dirname, 'build')));

// Middleware
app.use(express.json());

// Routes
app.use('/api', databaseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})