// Dit is de blauwdruk van wat de server terugstuurt na een succesvolle login

// Hier maken we de blauwdruk voor een 'User' (Gebruiker)
export interface User {
  id: number; // De computer onthoudt dat het ID ALTIJD een getal (number) moet zijn
  username: string; // De computer onthoudt dat de gebruikersnaam ALTIJD tekst (string) moet zijn
}

// Hier maken we de blauwdruk voor het totale antwoord (Response) dat je krijgt bij het inloggen
export interface LoginResponse {
  message: string; // Een tekstje van de server, bijvoorbeeld: "Login succesvol!"
  token: string; // Een geheime cijfercode (het digitale toegangsbewijs voor de app)
  user: User; // De gegevens van de gebruiker, die precies moeten voldoen aan de 'User' blauwdruk hierboven
}
