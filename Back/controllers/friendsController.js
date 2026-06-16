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
    //status 200 is gewoon status OK, je ziet status met f12 in browser
    res.status(200).json(rows);
  } catch (err) {
    //catch is voor als er een fout is bij je server crashed het veilig, het crashed niet alles maar alleen voor jou zodat andere gebruikers er geen last van hebben
    //res.status stuurt een status bericht 500 (internal server error), dit zegt dat er iets mis ging aan de kant van de server niet de gebruiker
    res.status(500).json({ error: err.message });
  }
};

// 2. Add a friend / Send request
//exports staat hier om het te gebruiken in andere bestanden zoals router
//async zorgt dat de database niet eerst voor 1 gebruiker een opdracht uitvoert en de anderen moeten wachten maar dat iedereen tegelijkere tijd dingen kunnen doen
exports.addFriend = async (req, res) => {
  //je zegt zoek userID en friendUsername in req.body, req.body is eigenlijk een tas met alle gegevens die de gebruiker naar je server stuurt, het is een soort bericht
  const { userId, friendUsername } = req.body;
  try {
    //await wacht even zodat het de code rustig kan uitvoeren
    const [users] = await db.execute(
      "SELECT id FROM users WHERE username = ?",
      [friendUsername],
    );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found." });

    //users[0] is de array met users en pak de eerste daar dus de 0
    const friendId = users[0].id;
    if (userId === friendId)
      return res.status(400).json({ error: "You cannot add yourself." });

    //als de bovenste niet werken dus dan is het goed want je kan jezelf niet toevoegen of een onbekende niet toevoegen, dan gaat het eerst wachten zodat de databank weer de code can uitvoeren en inplaats van add gebruikt het de CRUD methode(create read update delete) en gebruikt het insert op iemand toe te voegen
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
  //params kijkt naar e URL, bv hier de id van de URL
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
    //friendshipID is de waarde dat de sql code naar kijkt bij id = ?
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
    res.status(500).json({ error: err.message }); //err bevat alle informatie over de fout en de .message zet het om naar een menslijke leesbare fout
  }
};

// 6. Remove friend
//async: gebruiker 1 wilt iemand toevoegen dus de server stuurt naar de database terwijl gebruiker 2 daarna probeert in te loggen
// dit is beide met de database te maken en gebruiker 2 komt in de wachtrij te staan omdat de server eerst gebruiker 1 moet behandelen met async heb je dit niet
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
