import React, { useState } from "react";
import api from "../../api/axiosInstance";
import "./Register.css";

interface RegisterProps {
  onSwitch: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // NIEUW: States voor de username-check
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // NIEUW: Functie om de naam te checken bij de backend
  const checkUsernameAvailability = async () => {
    if (username.length < 3) return; // Check pas als er wat staat

    setIsChecking(true);
    try {
      const response = await api.get(`/auth/check-username/${username}`);
      if (!response.data.available) {
        setSuggestions(response.data.suggestions);
      } else {
        setSuggestions([]); // Naam is vrij
      }
    } catch (err) {
      console.error("Kon beschikbaarheid niet checken");
    }
    setIsChecking(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      alert(
        `Registration successful! Your username is: ${response.data.username}.`,
      );
      onSwitch();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Registration failed.";
      alert(errorMessage);
    }
  };

  return (
    <div className="auth-box">
      <h2>Create an account</h2>
      <form onSubmit={handleRegister}>
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={checkUsernameAvailability} // Check zodra je uit het vakje klikt
          placeholder="Username"
          required
        />

        {/* NIEUW: Toon suggesties als ze er zijn */}
        {suggestions.length > 0 && (
          <div className="suggestions">
            <p>Deze naam is al bezet. Probeer:</p>
            {suggestions.map((s) => (
              <button type="button" key={s} onClick={() => setUsername(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

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
    </div>
  );
};

export default Register;
