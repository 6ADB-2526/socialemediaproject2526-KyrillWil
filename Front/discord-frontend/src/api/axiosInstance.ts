// We importeren 'axios'. Dit is een kant-en-klaar hulpprogramma om brieven (data) te sturen over het internet.
import axios from "axios";

// We maken een vaste postbode aan die we 'api' noemen.
const api = axios.create({
  // Hier geven we het vaste hoofdadres (baseURL) van je server mee.
  // Telkens als deze postbode op pad wordt gestuurd met bijvoorbeeld "/auth/login",
  // plakt hij dat automatisch achter dit adres.
  // Hij loopt dan dus naar: "http://localhost:5000/api/auth/login"
  baseURL: "http://localhost:5000/api", // Dit moet eindigen op /api
});

// We exporteren deze postbode zodat het Dashboard, het Login-scherm en het Register-scherm hem allemaal kunnen gebruiken.
export default api;
