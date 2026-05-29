// routes/authRouter.js
const express = require("express");
const router = express.Router(); // Maakt een 'mini-router' aan voor authenticatie
const authController = require("../controllers/authController"); // Importeert de logica

// Definieert de routes voor registratie en inloggen
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

module.exports = router; // Exporteert de router voor gebruik in server.js
