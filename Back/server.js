// server.js is verantwoordelijk voor het opstarten van de server
const express = require("express"); //zorgt voor je code voor de server anders moet je heel veel code schrijven voor een simpele server
const cors = require("cors"); //zorgt dat als je frontend toestemming vraagt aan je backend het het krijgt(beveiliging)
require("dotenv").config(); // beveiliging van je wachtwoord om je server te verbinden met je databank

const app = express();

// === 1. Middlewares ===
app.use(cors()); // Staat React toe om te communiceren met de Node.js server
app.use(express.json()); // Schakelt het uitlezen van JSON-request-bodies in

// === 2. Importeer Routers ===
const authRouter = require("./routes/authRouter");
const friendsRouter = require("./routes/friendsRouter");
const messageRouter = require("./routes/messageRouter");

// === 3. Koppel Routes (Endpoints) ===
app.use("/api/auth", authRouter); // Routes voor registratie en inloggen, je api/auth is wat je invoert om ernaar te serven
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
