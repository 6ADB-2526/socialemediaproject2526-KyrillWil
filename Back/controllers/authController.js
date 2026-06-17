// controllers/authController.js
const db = require("../data/db");
const bcrypt = require("bcryptjs");

// === 1. Registreren van een nieuwe gebruiker ===
exports.registerUser = async (req, res) => {
  let { username, email, password } = req.body;

  // Basisvalidatie
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  try {
    // 1. Controleren of het e-mailadres al bestaat
    const [existingEmail] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existingEmail.length > 0) {
      return res
        .status(400)
        .json({ error: "This email address is already in use." });
    }

    // 2. LOGICA: Controleren of username bestaat en nummeren
    let finalUsername = username;
    let counter = 2;

    // Blijf checken zolang de naam in gebruik is
    while (true) {
      const [existingUser] = await db.execute(
        "SELECT id FROM users WHERE username = ?",
        [finalUsername],
      );

      // Als de lengte 0 is, betekent dit dat de naam vrij is
      if (existingUser.length === 0) {
        break;
      }

      // Naam is bezet, maak er "Naam2", "Naam3", enz. van
      finalUsername = `${username}${counter}`;
      counter++;
    }

    // 3. Wachtwoord veilig versleutelen
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Gebruiker opslaan met de definitieve (eventueel aangepaste) naam
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

// === 2. Inloggen van een bestaande gebruiker ===
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Fill in the email and password." });
  }

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res
        .status(401)
        .json({ error: "Incorrect email address or password." });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Incorrect email address or password." });
    }

    return res.status(200).json({
      message: "Successfully logged in!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
};
