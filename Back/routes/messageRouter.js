const express = require("express");
// We starten de mini-router van Express op om specifieke wegen (routes) aan te maken
const router = express.Router();
// We importeren de 'messageController'. Dat is de map met de échte logica en database-acties voor berichten
const messageController = require("../controllers/messageController");

// --- BERICHTEN ROUTES KOPPELEN (De wegbewijzers) ---

// ROUTE 1: Nieuw bericht sturen
// Als React een POST-verzoek stuurt naar "/api/messages", roepen we de functie 'sendMessage' aan
router.post("/", messageController.sendMessage);

// ROUTE 2: Chatgeschiedenis ophalen
// Als React een GET-verzoek stuurt met twee ID's (bijv: "/api/messages/1/2"),
// dan halen we alle berichtjes tussen deze twee gebruikers op met 'getMessages'
router.get("/:user1/:user2", messageController.getMessages);

// ROUTE 3: Bericht bewerken
// Als React een PUT-verzoek stuurt met het ID van een specifiek bericht (bijv: "/api/messages/45"),
// dan passen we dat bericht aan in de database met 'updateMessage'
router.put("/:id", messageController.updateMessage);

// ROUTE 4: Bericht verwijderen
// Als React een DELETE-verzoek stuurt met het ID van een specifiek bericht (bijv: "/api/messages/45"),
// dan wissen we dat bericht voorgoed uit de database met 'deleteMessage'
router.delete("/:id", messageController.deleteMessage);

// We exporteren deze wegwijzer zodat server.js hem kan gebruiken
module.exports = router;
