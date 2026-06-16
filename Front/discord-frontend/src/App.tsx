import { useState } from "react";
// We importeren de drie losse schermen (bouwblokken) je componenten die we eerder hebben gemaakt
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from "./components/Dashboard/Dashboard";
// De CSS-styling voor de algemene achtergrond van je app
import "./App.css";

function App() {
  // --- STATES (Het hoofdgeheugen van de hele website) ---

  // 'user' onthoudt wie er is ingelogd.
  // Staat dit op 'null' (niks)? Dan is er niemand ingelogd.
  // Staat er een gebruiker in? Dan mag diegene naar binnen!
  const [user, setUser] = useState<any>(null);

  // 'view' onthoudt welk formulier we moeten laten zien als er nog NIEMAND is ingelogd.
  // Dit kan "login" zijn (inlogscherm) of "register" (registratiescherm). We starten op "login".
  const [view, setView] = useState<"login" | "register">("login");
  //setView is een funcite, view heeft waarde zelf in setView is er om die waarde te veranderen
  // je moet altijd de soort aangeven bij state dus je zegt dat state je login of register kan zijn en je kiest voor login

  // --- SCHERM-CONTROLE 1: Welke grote pagina laten we zien? ---

  // Als 'user' gevuld is (dus niet null), betekent dit dat het inloggen is gelukt!
  if (user) {
    // We stoppen direct met de rest van de code en sturen de gebruiker naar het Dashboard.
    // We geven de ingelogde 'user' mee, en een functie 'onLogout'.
    // Als de gebruiker in het dashboard op de uitlogknop klikt, zetten we 'user' weer op 'null' (niks).
    // Omdat het geheugen dan verandert, springt de app direct weer terug naar de inlogpagina!
    return <Dashboard user={user} onLogout={() => setUser(null)} />;
    //de user is een object van interface van dashboard die je de value geeft die in user zit en als de object onLogout de setUser gelijk is aan null dan ben je uitgelogd dit gebeurt als je op de uitlog knop klikt in dashboard
  }

  // --- SCHERM-CONTROLE 2: Welk formulier tonen we als je NIET bent ingelogd? ---

  // Als we hier belanden, is 'user' dus 'null' (niemand is ingelogd).
  return (
    // De grote buitenste container die alles netjes in het midden van je computerscherm zet
    <div className="auth-wrapper">
      {/* Vraag aan het geheugen: Is de huidige view gelijk aan "login"? */}
      {view === "login" ? (
        //(? is gwn een if else)
        // JA: Laat het Login-scherm zien!
        // We geven 'setUser' mee aan 'onLoginSuccess'. Dus als het inloggen in dat scherm lukt,
        // vult hij hier in App.tsx de 'user' state, waardoor we naar het Dashboard schieten.
        // We geven ook een functie mee voor 'onSwitch': als je daar klikt op 'Register',
        // veranderen we hier het geheugen naar "register".
        <Login onLoginSuccess={setUser} onSwitch={() => setView("register")} />
      ) : (
        // NEE: Dan moet de view wel "register" zijn. Laat het Register-scherm zien!
        // We geven een functie mee voor 'onSwitch': als je daar klikt op 'Log in here'
        // (of als je registratie klaar is), zetten we het geheugen weer terug op "login".
        <Register onSwitch={() => setView("login")} />
      )}
    </div>
  );
}

// We exporteren App zodat de computer weet dat dit het startpunt van de website is
export default App;
