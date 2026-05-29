// We importeren de databaseverbinding (db) zodat we SQL-opdrachten kunnen sturen
const db = require("../data/db");

// ==========================================
// 1. CHATBERICHTEN OPSLAAN (Nieuw bericht versturen)
// ==========================================
exports.sendMessage = async (req, res) => {
  // We halen de zender (sender_id), ontvanger (receiver_id) en de tekst (message_text) uit het pakketje van React
  const { sender_id, receiver_id, message_text } = req.body;
  try {
    // We voeren een SQL-opdracht uit om het nieuwe bericht in de tabel 'messages' te stoppen
    // De vraagtekens (?) zijn een veilige manier om te voorkomen dat hackers de database slopen
    const [result] = await db.execute(
      "INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)",
      [sender_id, receiver_id, message_text],
    );

    // Als het opslaan is gelukt, sturen we een succesberichtje terug naar React met alle gegevens van het nieuwe bericht
    res.json({
      id: result.insertId, // Het unieke nummer (ID) dat de database automatisch aan dit bericht heeft gegeven
      sender_id,
      receiver_id,
      message_text,
      created_at: new Date(), // De datum en tijd van NU
    });
  } catch (err) {
    // Als er een fout optreedt (bijv. database ligt plat), sturen we foutcode 500 met de foutmelding
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 2. CHATBERICHTEN OPHALEN (De chatgeschiedenis laden)
// ==========================================
exports.getMessages = async (req, res) => {
  // We halen de ID's van de twee gebruikers uit het internetadres (bijv: /api/messages/1/2)
  const { user1, user2 } = req.params;
  try {
    // We vragen aan de database: Geef mij alle berichten waar:
    // (Zender = Ik EN Ontvanger = Mijn vriend) OF (Zender = Mijn vriend EN Ontvanger = Ik)
    // Sorteer ze op de aanmaaktijd (created_at ASC), zodat de oudste berichtjes bovenaan staan en de nieuwste onderaan
    const [messages] = await db.execute(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY created_at ASC`,
      [user1, user2, user2, user1],
    );
    // Stuur de hele lijst met gevonden berichtjes terug naar React om op het scherm te tonen
    res.json(messages);
  } catch (err) {
    // Als er iets misgaat, stuur een foutmelding
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 3. BERICHT UPDATEN (Je bericht bewerken)
// ==========================================
exports.updateMessage = async (req, res) => {
  // We halen het unieke ID van het bericht uit het internetadres (bijv: /api/messages/45)
  const { id } = req.params;
  // We halen de gloednieuwe, aangepaste tekst uit het pakketje van React
  const { message_text } = req.body;
  try {
    // We zeggen tegen de database: Verander de tekst (SET message_text) van het bericht dat dit specifieke ID heeft
    await db.execute("UPDATE messages SET message_text = ? WHERE id = ?", [
      message_text,
      id,
    ]);
    // Laat aan React weten dat het aanpassen is gelukt!
    res.status(200).json({ message: "Message edited successfully" });
  } catch (err) {
    // Als er iets misgaat, stuur een foutmelding
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 4. BERICHT VERWIJDEREN
// ==========================================
exports.deleteMessage = async (req, res) => {
  // We halen het unieke ID van het bericht dat weggestreept moet worden uit het internetadres
  const { id } = req.params;
  try {
    // We sturen een SQL-commando om de rij met dit specifieke ID voorgoed te wissen uit de tabel 'messages'
    await db.execute("DELETE FROM messages WHERE id = ?", [id]);
    // Laat aan React weten dat het verwijderen helemaal is gelukt!
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    // Als er iets misgaat, stuur een foutmelding
    res.status(500).json({ error: err.message });
  }
};
