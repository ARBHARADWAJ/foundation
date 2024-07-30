const express = require("express");
const app = express();
const port = 3001; // You can change this port to your desired value
const cors = require("cors");
const axios = require("axios");
const db = require("./db/Connect");
const { createUsers } = require("./db/db_functions");

// Middleware to parse JSON bodies
app.use(express.json()); // Add this line
app.use(cors());

// Basic route
app.get("/", (req, res) => {
  res.send("Jai shree ram");
});

app.post("/registers", async (req, res) => {
  const { name, email, phno, selectedOptions } = req.body;
  console.log(req.body);
  try {
    createUsers(name, email, phno, selectedOptions);
    console.log(name, email, phno, selectedOptions);
    res.status(200).json({ val1: true });
  } catch (e) {
    res.status(500).json({ message: "An error occurred.", error: e.message });
    console.log(e);
  }
});

// Start the server
app.listen(port, () => {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS eventusers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100),
      phno VARCHAR(15),
      selected_options JSON
    );
    `;

  db.query(createTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating table:", err);
      return;
    }

    console.log("Users table created successfully.");
  });
  console.log(`Server is running on http://localhost:${port}`);
});
