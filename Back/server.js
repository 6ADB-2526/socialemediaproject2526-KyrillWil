// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Laadt omgevingsvariabelen uit het .env bestand

const app = express();

// === 1. Middlewares ===
app.use(cors()); // Staat React toe om te communiceren met de Node.js server
app.use(express.json()); // Schakelt het uitlezen van JSON-request-bodies in

// === 2. Importeer Routers ===
const authRouter = require("./routes/authRouter");
const friendsRouter = require("./routes/friendsRouter");
const messageRouter = require("./routes/messageRouter");

// === 3. Koppel Routes (Endpoints) ===
app.use("/api/auth", authRouter); // Routes voor registratie en inloggen
app.use("/api/friends", friendsRouter); // Vriendenlijst, verzoeken verzenden/accepteren/weigeren
app.use("/api/messages", messageRouter); // Berichten (versturen, ophalen, bewerken, verwijderen)

// Basisroute voor het testen van de API-status (http://localhost:5000)
app.get("/", (req, res) => {
  res.send("Discord Clone API is live and operational!");
});

// === 4. Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Server successfully started on port ${PORT}`);
  console.log(`🔐 Auth endpoints:    http://localhost:${PORT}/api/auth`);
  console.log(`👥 Friends endpoints: http://localhost:${PORT}/api/friends`);
  console.log(`💬 Message endpoints: http://localhost:${PORT}/api/messages`);
  console.log(`===================================================`);
});
