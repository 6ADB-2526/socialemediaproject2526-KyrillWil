const mysql = require("mysql2");

const db = mysql.createPool({
  // Gebruik 'createPool' in plaats van 'createConnection' voor betere prestaties
  host: "localhost",
  user: "root",
  password: "test123",
  database: "discord_db",
});

module.exports = db.promise(); // .promise() zorgt ervoor dat we moderne code (async/await) kunnen gebruiken
