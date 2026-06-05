// controllers/friendsController.js
const db = require("../data/db"); // Ensure the path to your database connection is correct

// 1. Get friend list
exports.getFriends = async (req, res) => {
  // een vraag kan zijn wat gebeurd er als ik req en res omwissel (kijk one note)
  const { userId } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.username 
       FROM friendships f
       JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
       WHERE (f.user_id = ? OR f.friend_id = ?) 
         AND f.status = 'accepted' 
         AND u.id != ?`, //dit is sql code, word niet gevraagd
      [userId, userId, userId],
    );
    res.status(200).json(rows);
  } catch (err) {
    //als er een fout is bij je server crashed het veilig
    res.status(500).json({ error: err.message });
  }
};

// 2. Add a friend / Send request
exports.addFriend = async (req, res) => {
  const { userId, friendUsername } = req.body;
  try {
    const [users] = await db.execute(
      "SELECT id FROM users WHERE username = ?",
      [friendUsername],
    );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found." });

    const friendId = users[0].id;
    if (userId === friendId)
      return res.status(400).json({ error: "You cannot add yourself." });

    await db.execute(
      "INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'pending')",
      [userId, friendId],
    );
    res.status(201).json({ message: "Friend request sent!" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "This request already exists or something went wrong." });
  }
};

// 3. Get pending requests
exports.getPendingRequests = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT f.id AS friendship_id, u.username 
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = ? AND f.status = 'pending'`,
      [userId],
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Accept friend request
exports.acceptFriend = async (req, res) => {
  const { friendshipId } = req.params;
  try {
    await db.execute(
      "UPDATE friendships SET status = 'accepted' WHERE id = ?",
      [friendshipId],
    );
    res.status(200).json({ message: "Friendship accepted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Decline friend request
exports.declineFriend = async (req, res) => {
  const { friendshipId } = req.params;
  try {
    const idToDelete = parseInt(friendshipId, 10);
    await db.execute("DELETE FROM friendships WHERE id = ?", [idToDelete]);
    res.status(200).json({ message: "Friend request declined." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Remove friend
exports.removeFriend = async (req, res) => {
  const { userId, friendId } = req.params;
  try {
    await db.execute(
      `DELETE FROM friendships 
       WHERE (user_id = ? AND friend_id = ?) 
          OR (user_id = ? AND friend_id = ?)`,
      [userId, friendId, friendId, userId],
    );
    res.status(200).json({ message: "Friend removed." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
