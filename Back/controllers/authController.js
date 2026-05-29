// controllers/authController.js
const db = require("../data/db");
// Tip voor je eindwerk: Gebruik 'bcryptjs' om wachtwoorden te beveiligen!
const bcrypt = require("bcryptjs");

// === 1. Registreren van een nieuwe gebruiker ===
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Basisvalidatie om te controleren of alle velden zijn ingevuld
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  try {
    // Controleren of het e-mailadres al bestaat in de database
    const [existingUser] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ error: "This email address is already in use." });
    }

    // Wachtwoord veilig versleutelen (hashen) voordat het wordt opgeslagen
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Gebruiker opslaan in de 'users' tabel
    await db.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
    );

    return res
      .status(201)
      .json({ message: "Account successfully created! You can now log in." });
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

  // Basisvalidatie voor e-mail en wachtwoord
  if (!email || !password) {
    return res.status(400).json({ error: "Fill in the email and password." });
  }

  try {
    // Gebruiker zoeken in de database op basis van e-mail
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res
        .status(401)
        .json({ error: "Incorrect email address or password." });
    }

    const user = users[0];

    // Het ingevulde wachtwoord vergelijken met de opgeslagen hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Incorrect email address or password." });
    }

    // Succes! Stuur gebruikersinfo terug (wachtwoord blijft in de backend)
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
