// routes/authRouter.js
const express = require("express");
const router = express.Router(); // Maakt een 'mini-router' aan voor authenticatie, dit is eigenlijk de code om te zeggen dat dit de router is zonder dat je het zelf moet schrijven
const authController = require("../controllers/authController"); // Importeert de logica, importeerd je controller waar je functies instaan

// Definieert de routes voor registratie en inloggen
router.post("/register", authController.registerUser); //post is data versturen/doorgeven, je geeft nieuwe data aan je databank want er word een nieuwe gebruiker gecreërd dus je geeft username en w8woord
router.post("/login", authController.loginUser);

module.exports = router; // Exporteert de router voor gebruik in server.js
