import React, { useState } from "react";
// We importeren onze 'api' postbode om de inloggegevens naar de database te sturen
import api from "../../api/axiosInstance";
// De CSS-styling voor de look van het inlogscherm (bijvoorbeeld een mooi gecentreerd blok)
import "./Login.css";

// Dit is een contractje (interface) dat zegt: dit component heeft twee functies nodig van zijn baas (App.tsx):
// 1. onLoginSuccess: wat moeten we doen als het inloggen lukt?
// 2. onSwitch: wat moeten we doen als de gebruiker op 'Registreren' klikt?
interface LoginProps {
  onLoginSuccess: (user: any) => void;
  onSwitch: () => void;
}

// We starten het Login-scherm en geven de twee functies mee aan het component
const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitch }) => {
  // --- STATES (Het geheugen van je inlogscherm) ---
  const [email, setEmail] = useState(""); // Onthoudt het e-mailadres dat de gebruiker NU aan het typen is
  const [password, setPassword] = useState(""); // Onthoudt het wachtwoord dat de gebruiker NU aan het typen is

  // Deze functie start zodra de gebruiker op de "Log In" knop klikt (of op Enter drukt)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Zorg ervoor dat de internetpagina niet direct ververst, anders zijn we onze gegevens kwijt
    try {
      // De postbode (api) brengt het e-mailadres en wachtwoord in een enveloppe naar de backend (/auth/login)
      const res = await api.post("/auth/login", { email, password });

      // Als de database zegt "Klopt!", voeren we onLoginSuccess uit en geven we de gebruikersgegevens door
      onLoginSuccess(res.data.user);
    } catch (err) {
      // Als de database zegt "Dit klopt niet!", krijgt de gebruiker een pop-up met een foutmelding
      alert("Login failed. Please check your credentials.");
    }
  };

  // --- HTML / JSX (Wat er daadwerkelijk op je scherm getekend wordt) ---
  return (
    // De hoofdcontainer (het inlogblok)
    <div className="auth-box">
      {/* De grote titel bovenaan het inlogscherm */}
      <h2>Welcome back!</h2>

      {/* Het formulier waar de invulvelden in zitten */}
      <form onSubmit={handleLogin}>
        {/* Het label en invoerveld voor het E-mailadres */}
        <label>Email</label>
        <input
          type="email" // Zorgt ervoor dat de browser weet dat dit een e-mailadres moet zijn
          value={email} // Dit veld laat altijd zien wat er in de 'email' state (het geheugen) staat
          onChange={(e) => setEmail(e.target.value)} // Elke keer als je een letter typt, updaten we direct het geheugen
          placeholder="test@example.com" // De grijze voorbeeldtekst als het veld nog leeg is
          required // Je MAG dit veld niet leeg laten van de computer
        />

        {/* Het label en invoerveld voor het Wachtwoord */}
        <label>Password</label>
        <input
          type="password" // Zorgt ervoor dat je letters veranderen in zwarte bolletjes (••••), zodat niemand kan meekijken
          value={password} // Dit veld laat altijd zien wat er in de 'password' state staat
          onChange={(e) => setPassword(e.target.value)} // Elke keer als je een letter typt, updaten we direct het wachtwoord-geheugen
          placeholder="••••••••••••" // De grijze voorbeeld-bolletjes
          required // Je MAG dit veld ook niet leeg laten
        />

        {/* De inlogknop. Omdat het type="submit" is, activeert deze knop automatisch de 'handleLogin' functie hierboven */}
        <button type="submit">Log In</button>
      </form>

      {/* De tekst onder de knop voor als je nog geen account hebt */}
      <p className="switch-text">
        Don't have an account?{" "}
        {/* Als je op 'Register here' klikt, roepen we 'onSwitch' aan en springt het scherm over naar het Registratiescherm */}
        <span onClick={onSwitch}>Register here.</span>
      </p>
    </div>
  );
};

// We exporteren het Login-scherm zodat we het in App.tsx kunnen gebruiken
export default Login;
