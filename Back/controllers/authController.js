// controllers/authController.js
const db = require("../data/db");
const bcrypt = require("bcryptjs");

// === 1. Registreren van een nieuwe gebruiker ===
exports.registerUser = async (req, res) => {
  let { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  try {
    // Controleren of het e-mailadres al bestaat
    const [existingEmail] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existingEmail.length > 0) {
      return res
        .status(400)
        .json({ error: "This email address is already in use." });
    }

    // LOGICA: Unieke gebruikersnaam genereren
    let finalUsername = username;
    let counter = 2;

    while (true) {
      const [existingUser] = await db.execute(
        "SELECT id FROM users WHERE username = ?",
        [finalUsername],
      );
      if (existingUser.length === 0) {
        break; // Naam is vrij
      }
      finalUsername = `${username}${counter}`;
      counter++;
    }

    // Wachtwoord hashen
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Gebruiker opslaan in de database
    await db.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [finalUsername, email, hashedPassword],
    );

    return res.status(201).json({
      message: "Account successfully created!",
      username: finalUsername, // Stuur de definitieve naam terug
    });
  } catch (err) {
    console.error("Fout bij registratie:", err);
    return res
      .status(500)
      .json({ error: "Server error when creating the account." });
  }
};

// === 2. Inloggen ===
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Fill in all fields." });

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(401).json({ error: "Incorrect email or password." });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Incorrect email or password." });

    return res.status(200).json({
      message: "Successfully logged in!",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
};

// === 3. Check of gebruikersnaam beschikbaar is (voor de frontend suggesties) ===
exports.checkUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const [existingUser] = await db.execute(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );

    if (existingUser.length > 0) {
      // Naam is bezet: stuur suggesties terug
      return res.status(200).json({
        available: false,
        suggestions: [`${username}123`, `${username}_pro`, `user_${username}`],
      });
    }

    // Naam is vrij
    return res.status(200).json({ available: true });
  } catch (err) {
    return res.status(500).json({ error: "Server error during check." });
  }
};
