import React, { useState } from "react";
// We importeren onze 'api' postbode om de nieuwe accountgegevens naar de database te sturen
import api from "../../api/axiosInstance";
// De CSS-styling voor de look van het registratiescherm
import "./Register.css";

// Dit is de interface (het contractje). Het vertelt ons dat dit component één functie nodig heeft van zijn baas (App.tsx):
// onSwitch: wat moeten we doen als de gebruiker op 'Log in here' klikt, of als het registreren klaar is? (Wisselen van scherm)
interface RegisterProps {
  onSwitch: () => void;
}

// We starten het Register-scherm en geven de onSwitch-functie mee aan het component
const Register: React.FC<RegisterProps> = ({ onSwitch }) => {
  // --- STATES (Het geheugen van je registratiescherm) ---
  const [username, setUsername] = useState(""); // Onthoudt de gebruikersnaam die de persoon NU typt
  const [email, setEmail] = useState(""); // Onthoudt het e-mailadres dat de persoon NU typt
  const [password, setPassword] = useState(""); // Onthoudt het gekozen wachtwoord dat de persoon NU typt

  // Deze functie start zodra de gebruiker op de grote "Register" knop klikt (of op Enter drukt)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Zorg ervoor dat de internetpagina niet ververst, anders wist de browser alle invoer
    try {
      // De postbode (api) brengt de ingevulde username, email en password in een enveloppe naar de database (/auth/register)
      await api.post("/auth/register", { username, email, password });

      // Als de database zegt: "Helemaal goed, ik heb het opgeslagen!", tonen we deze pop-up:
      alert("Registration successful! You can now log in.");

      onSwitch(); // We roepen de wissel-functie aan om de gebruiker automatisch terug te sturen naar het Inlogscherm
    } catch (err) {
      // Als er iets misgaat (bijvoorbeeld: het e-mailadres staat al in de database), tonen we deze foutmelding:
      alert("Registration failed. Email might already exist.");
    }
  };

  // --- HTML / JSX (Wat er daadwerkelijk op je scherm getekend wordt) ---
  return (
    // De hoofdcontainer (het registratieblok)
    <div className="auth-box">
      {/* De grote titel bovenaan het registratiescherm */}
      <h2>Create an account</h2>

      {/* Het formulier waar alle invulvelden in zitten */}
      <form onSubmit={handleRegister}>
        {/* Het label en invoerveld voor de Gebruikersnaam */}
        <label>Username</label>
        <input
          type="text" // Gewone tekstinvoer
          value={username} // Dit veld laat altijd zien wat er in de 'username' state (het geheugen) staat
          onChange={(e) => setUsername(e.target.value)} // Elke keer als je een letter typt, updaten we direct het username-geheugen
          placeholder="Username" // De grijze voorbeeldtekst
          required // Dit veld MOET ingevuld worden
        />

        {/* Het label en invoerveld voor het E-mailadres */}
        <label>Email</label>
        <input
          type="email" // Zorgt dat de browser controleert of er wel een '@' en een '.' in de tekst staat
          value={email} // Dit veld laat altijd zien wat er in de 'email' state staat
          onChange={(e) => setEmail(e.target.value)} // Elke keer als je een letter typt, updaten we het e-mail-geheugen
          placeholder="email@example.com" // De grijze voorbeeld-email
          required // Dit veld MOET ook ingevuld worden
        />

        {/* Het label en invoerveld voor het Wachtwoord */}
        <label>Password</label>
        <input
          type="password" // Verandert de letters direct in zwarte bolletjes (••••) tegen meekijkers
          value={password} // Dit veld laat altijd zien wat er in de 'password' state staat
          onChange={(e) => setPassword(e.target.value)} // Elke keer als je een letter typt, updaten we het wachtwoord-geheugen
          placeholder="Choose a strong password" // De grijze voorbeeldtekst
          required // Dit veld MOET ook ingevuld worden
        />

        {/* De registreerknop. Omdat het type="submit" is, activeert deze knop direct de 'handleRegister' functie hierboven */}
        <button type="submit">Register</button>
      </form>

      {/* De tekst helemaal onderaan voor als je per ongeluk al een account had */}
      <p className="switch-text">
        Already have an account?{" "}
        {/* Als je hierop klikt, roepen we 'onSwitch' aan en springt het scherm direct terug naar het Inlogscherm */}
        <span onClick={onSwitch}>Log in here.</span>
      </p>
    </div>
  );
};

// We exporteren het Register-scherm zodat we het kunnen gebruiken in App.tsx
export default Register;
