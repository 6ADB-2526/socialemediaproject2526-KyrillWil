import React, { useState } from "react";
// We importeren onze 'api' postbode om de nieuwe accountgegevens naar de database te sturen
import api from "../../api/axiosInstance";
// De CSS-styling voor de look van het registratiescherm
import "./Register.css";

// Interface voor de onSwitch functie
interface RegisterProps {
  onSwitch: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch }) => {
  // --- STATES ---
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- HANDLERS ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // De postbode (api) brengt de gegevens naar de database
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      // De server stuurt de definitieve (eventueel aangepaste) naam terug
      const finalUsername = response.data.username;

      // Toon een persoonlijke melding aan de gebruiker
      alert(
        `Registration successful! Your official username is: ${finalUsername}. You can now log in.`,
      );

      // We sturen de gebruiker door naar het inlogscherm
      onSwitch();
    } catch (err: any) {
      // Toon een foutmelding als er iets misgaat (bijv. e-mail al in gebruik)
      const errorMessage = err.response?.data?.error || "Registration failed.";
      alert(errorMessage);
    }
  };

  // --- JSX (De interface) ---
  return (
    <div className="auth-box">
      <h2>Create an account</h2>

      <form onSubmit={handleRegister}>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a strong password"
          required
        />

        <button type="submit">Register</button>
      </form>

      <p className="switch-text">
        Already have an account? <span onClick={onSwitch}>Log in here.</span>
      </p>
    </div>
  );
};

export default Register;
