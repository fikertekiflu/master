const express = require('express');
const cors = require('cors');
const overviewRoutes = require('./routes/overviewRoute');
const salesRoutes = require('./routes/salesRoutes');
const pool = require('./config/db'); 

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

// Routes
app.use('/api/overview', overviewRoutes);
app.use('/api/sales', salesRoutes);


// Function to test database connection
async function checkDatabaseConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('Successfully connected to PostgreSQL database!');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error);

  }
}

// Start the server and check the database connection
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  checkDatabaseConnection();
});