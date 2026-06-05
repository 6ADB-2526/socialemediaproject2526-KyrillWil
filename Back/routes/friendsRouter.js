// routes/friendsRouter.js
const express = require("express");
const router = express.Router();
const friendsController = require("../controllers/friendsController");

// Alle specifieke routes netjes onder elkaar (decline BOVENaan bij de DELETE routes!)
router.get("/:userId", friendsController.getFriends);
router.post("/add", friendsController.addFriend);
router.get("/pending/:userId", friendsController.getPendingRequests); //get informatie krijgen/vragen, pending/userID is naar waar je surft en userID is de id van jou zodat je kunt zien bij pending wie je wilt toevoegen. De .getPendingRequest is een functie die word uitgevoerd die in je controller staat
router.put("/accept/:friendshipId", friendsController.acceptFriend);

// DELETE routes: decline staat VEILIG boven de twee ID's
router.delete("/decline/:friendshipId", friendsController.declineFriend);
router.delete("/:userId/:friendId", friendsController.removeFriend);

module.exports = router;
