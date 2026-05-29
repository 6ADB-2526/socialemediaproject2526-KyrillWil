// routes/friendsRouter.js
const express = require("express");
const router = express.Router();
const friendsController = require("../controllers/friendsController");

// Alle specifieke routes netjes onder elkaar (decline BOVENaan bij de DELETE routes!)
router.get("/:userId", friendsController.getFriends);
router.post("/add", friendsController.addFriend);
router.get("/pending/:userId", friendsController.getPendingRequests);
router.put("/accept/:friendshipId", friendsController.acceptFriend);

// DELETE routes: decline staat VEILIG boven de twee ID's
router.delete("/decline/:friendshipId", friendsController.declineFriend);
router.delete("/:userId/:friendId", friendsController.removeFriend);

module.exports = router;
