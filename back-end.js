const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
app.use(cors());
const { Database } = require("@sqlitecloud/drivers");

const db = new Database(
  `sqlitecloud://crfbccaanz.g2.sqlite.cloud:8860/chinook.sqlite?apikey=KtqGuVudsPBBMaQPn0V1qaISMESzWUBZEhTU5SNQq8M`
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "front-end.html"));
});

// Register route
app.post("/register", async (req, res) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Form (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT
    );
  `);
  const { name, email } = req.body;
  console.log(name, email);

  if (!name || !email) {
    return res.status(400).send("Name and email are required.");
  }

  try {
    await db.run("INSERT INTO Form (name, email) VALUES (?, ?)", [name, email]);
    res.status(200).send("Registration successful!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user.");
  }
});

// Route to display all users
app.get("/data", async (req, res) => {
  try {
    // Run the query and capture the result
    const rows = await db.sql("SELECT * FROM Form");

    if (!rows || rows.length === 0) {
      return res.send("<h3 style='text-align:center;'>No users found.</h3>");
    }

    // Build HTML table
    let table = `
      <h2 style="text-align:center;">Registered Users</h2>
      <table border="1" cellspacing="0" cellpadding="8" style="margin:auto; font-family: Arial;">
        <tr><th>ID</th><th>Name</th><th>Email</th></tr>
    `;

    rows.forEach((user) => {
      table += `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.email}</td></tr>`;
    });

    table += `</table>`;
    res.send(table);
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).send("Error retrieving data.");
  }
});

app.listen(8080, () => console.log("server has started!"));
