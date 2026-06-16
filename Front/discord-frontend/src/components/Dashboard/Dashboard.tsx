import React, { useEffect, useState, useRef } from "react";
// Importeer de geconfigureerde axios-instantie voor API-communicatie
import api from "../../api/axiosInstance";
// Importeer de bijbehorende CSS-bestanden
import "./Dashboard.css";

//alle states die je gebruikt in je dashboard
// Het Dashboard-component is het hoofdvenster na het inloggen
const Dashboard = ({ user, onLogout }: any) => {
  // --- STATES: Het geheugen van het component ---
  const [friends, setFriends] = useState<any[]>([]); // Lijst met geaccepteerde vrienden
  const [pendingRequests, setPendingRequests] = useState<any[]>([]); // Lijst met inkomende vriendschapsverzoeken
  const [selectedUser, setSelectedUser] = useState<any>(null); // De vriend waarmee momenteel wordt gechat
  const [message, setMessage] = useState(""); // De tekst die op dit moment wordt getypt in het inputveld
  const [chatHistory, setChatHistory] = useState<any[]>([]); // Alle berichten van het actieve gesprek

  // Bepaalt of we de 'Friendlist' of de 'Pending' (verzoeken) tab tonen
  const [activeTab, setActiveTab] = useState<"online" | "pending">("online");

  // Beheer voor de UI-elementen (kebab-menu voor opties, bewerkingsmodus)
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  //einde use states

  // useRef wordt gebruikt om direct naar de onderkant van de chat te scrollen bij nieuwe berichten
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Functie om de scrollpositie naar beneden te dwingen
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Zodra chatHistory verandert (nieuw bericht), scroll naar beneden
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Haalt de lijsten op via de backend API
  const loadFriendsAndRequests = async () => {
    try {
      const friendsRes = await api.get(`/friends/${user.id}`);
      setFriends(friendsRes.data);

      const pendingRes = await api.get(`/friends/pending/${user.id}`);
      setPendingRequests(pendingRes.data);
    } catch (err) {
      console.error("Fout bij ophalen vrienden/verzoeken", err);
    }
  };

  // Eerste keer laden bij mounten, alle gegevens geladen van de gebruiker met die user id en deze word bij andere functies geplaatst want deze moet soms refreshen of geupdate worden
  useEffect(() => {
    loadFriendsAndRequests();
  }, [user.id]);

  // Polling: Elke 4 seconden de data verversen (berichten en status)
  useEffect(() => {
    const fetchData = () => {
      // Alleen chatgeschiedenis ophalen als we in een chat zitten en niet aan het bewerken zijn
      if (selectedUser && editingId === null) {
        api
          .get(`/messages/${user.id}/${selectedUser.id}`)
          .then((res) => setChatHistory(res.data))
          .catch(() => console.log("Chat kon niet geladen worden"));
      }
      loadFriendsAndRequests();
    };

    fetchData(); // Direct uitvoeren
    const interval = setInterval(fetchData, 4000); // Herhalen, refreshed de data die in fetchData is na 4000milisceonden dus 4seconden
    return () => clearInterval(interval); // Opruimen bij stoppen
  }, [selectedUser, user.id, editingId]); //het staat daar om deze 3 in de gaten te houden als het veranderd dan moet useEffect het op de achtergrond aanpassen

  // --- FUNCTIES VOOR ACTIES ---

  // Vriend toevoegen via gebruikersnaam
  const handleAddFriend = async () => {
    //window.promt is ingebouwd in browser dus niet zelf geschreven
    const friendUsername = window.prompt(
      "Geef de gebruikersnaam van je vriend:",
    );
    if (!friendUsername || !friendUsername.trim()) return;

    try {
      // /friends/add is surft naar je route of endpoint
      const res = await api.post("/friends/add", {
        //je stuurt eerst je eigen id en dan de persoon waarmee je vrienden wilt worden
        userId: user.id,
        friendUsername: friendUsername.trim(),
      });
      alert(res.data.message);
      loadFriendsAndRequests(); //het heeft net een actie uitgevoerd dus het vraagt om de info hier te refreshen en de meest recente info te krijgen
    } catch (err: any) {
      alert(err.response?.data?.error || "Er is iets misgegaan.");
    }
  };

  // Vriend verwijderen
  const removeFriend = async (friendId: number) => {
    if (!window.confirm("Weet je zeker dat je deze vriend wilt verwijderen?"))
      return;
    try {
      await api.delete(`/friends/${user.id}/${friendId}`);
      setFriends((prev) => prev.filter((f) => f.id !== friendId)); //prev(previous) is de huidige waarde van je state of tewel hetgene voordat je op de knop klikte om iets aan te passen
      if (selectedUser?.id === friendId) setSelectedUser(null); // de ? zegt als het null is dat het undifiend is anders crashed het, het kijkt hier naar de gene die je hebt verwijderd en veranderd de selecteduser naar 0 en dat zorgt dat de chats met die persoon gesloten worden
    } catch (err) {
      console.error("Verwijderen mislukt:", err);
    }
  };

  // Vriendschapsverzoek accepteren
  const acceptRequest = async (friendshipId: number) => {
    try {
      await api.put(`/friends/accept/${friendshipId}`);
      loadFriendsAndRequests(); // loadfriendandreq eigenlijk laat dat alle data van de database in of alleen je vrienden die je hebt en de vriendschapverzoeken die je krijgt, zonder dit ga je de oude dingen zien en refreshed het niet
    } catch (err) {
      console.error("Accepteren mislukt", err);
    }
  };

  // Verzoek weigeren
  const declineRequest = async (friendshipId: number) => {
    try {
      await api.delete(`/friends/decline/${friendshipId}`);
      setPendingRequests(
        (prev) => prev.filter((r) => r.friendship_id !== friendshipId), //Dit is de "selectie-check". Je zegt: "Houd alle verzoeken in de lijst, BEHALVE degene waarvan het ID gelijk is aan het ID dat we net hebben afgewezen."
      );
    } catch (err) {
      console.error("Weigeren mislukt", err);
    }
  };

  // Bericht verwijderen
  const deleteMessage = async (id: number) => {
    try {
      await api.delete(`/messages/${id}`);
      setChatHistory((prev) => prev.filter((m: any) => m.id !== id));
      setActiveMenuId(null);
    } catch (err) {
      console.error("Verwijderen mislukt");
    }
  };

  // Bewerkte tekst opslaan naar database
  const saveEdit = async (id: number) => {
    const trimmedValue = editValue.trim();
    if (!trimmedValue) {
      //! betekent als het false is maar je vergelijkt het hier met niks dus het kijkt of het null of leeg is
      setEditingId(null); //annuleert de edit omdat het null of leeg is zelfs met trim want trim doet de spaties weg en als je dan niks hebt
      return;
    }
    try {
      await api.put(`/messages/${id}`, { message_text: trimmedValue });
      setChatHistory((prev) =>
        prev.map((m: any) =>
          m.id === id ? { ...m, message_text: trimmedValue } : m,
        ),
      );
      setEditingId(null); //tijdens het editen is het 1 en na het opslaan is het terug 0
    } catch (err) {
      console.error("Bewerken mislukt");
    }
  };

  // Nieuw bericht verzenden
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); //zorgt dat je na enter klikt de pagina niet automatisch refreshed
    if (!message.trim() || !selectedUser) return; // ! is als het bericht leeg is stopt de functie of als de selected user leeg is dus gene meer geselecteerd dan stopt het ook
    try {
      const res = await api.post("/messages", {
        //hier zegt het dat het iets wilt sturen/posten en daaronder geeft het de gegevens naar wie het wilt sturen en wat
        sender_id: user.id,
        receiver_id: selectedUser.id,
        message_text: message,
      });
      setChatHistory((prev) => [...prev, res.data]); //je haalt alles uit de vorige chatHistory en spread het uit en je voegt je nieuwe bericht dus je res.data eraan toe. Jij ziet hier de code verschijnen maar de gebruiker ziet het verschijnen door het te refreshen maar omdat ik een polling gebruik met een int erval die om de 4 seconden refreshed ziet hij het zonder te refreshen
      setMessage(""); // Inputveld weer leegmaken
    } catch (err) {
      console.error("Verzenden mislukt");
    }
  };

  // --- RENDER (De visuele weergave) ---
  return (
    <div className="discord-layout">
      {/* Linkerzijbalk: Navigatie en vriendenlijst */}
      <nav className="sidebar">
        <div className="sidebar-content">
          <div
            className={`nav-item ${!selectedUser ? "active" : ""}`}
            onClick={() => {
              setSelectedUser(null);
              setActiveTab("online");
            }}
          >
            <span className="icon">🏠</span>
            <span className="label">Home</span>
          </div>

          <div className="dm-header">
            <span>DIRECT MESSAGES</span>
          </div>
          {friends.map((f: any) => (
            <div
              key={f.id}
              className={`user-item ${selectedUser?.id === f.id ? "active" : ""}`}
              onClick={() => setSelectedUser(f)}
            >
              <div className="avatar">
                {f.username[0].toUpperCase()}{" "}
                <div className="status-dot online"></div>
              </div>
              <span className="username">{f.username}</span>
            </div>
          ))}
        </div>

        {/* Gebruikerspaneel onderaan de sidebar */}
        <div className="user-panel">
          <div className="user-panel-left">
            <div className="avatar small">{user.username[0].toUpperCase()}</div>
            <div className="user-meta">
              <div className="name">{user.username}</div>
              <div className="status">Online</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            🚪
          </button>
        </div>
      </nav>

      {/* Hoofdvenster: Chat of Friendlist */}
      <main className="main-view">
        {selectedUser ? (
          // CHAT-VENSTER
          <div className="chat-container">
            <header className="top-bar">
              <span className="at">@</span>
              <span className="title">{selectedUser.username}</span>
            </header>
            <div className="messages-flow">
              <div className="messages-inner">
                {chatHistory.map((m: any) => (
                  <div key={m.id} className="discord-message">
                    <div className="message-avatar">
                      {m.sender_id === user.id
                        ? user.username[0].toUpperCase()
                        : selectedUser.username[0].toUpperCase()}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-user">
                          {m.sender_id === user.id
                            ? user.username
                            : selectedUser.username}
                        </span>
                        <span className="message-timestamp">
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {/* Bewerking modus: toon inputveld als we dit specifieke bericht bewerken */}
                      {editingId === m.id ? (
                        <div className="edit-container">
                          <input
                            autoFocus
                            className="edit-input"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e: any) => {
                              if (e.key === "Enter") saveEdit(m.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          />
                          <div className="edit-help">
                            escape to{" "}
                            <span
                              className="link"
                              onMouseDown={() => setEditingId(null)}
                            >
                              cancel
                            </span>{" "}
                            • enter to{" "}
                            <span
                              className="link"
                              onMouseDown={() => saveEdit(m.id)}
                            >
                              save
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="message-text">{m.message_text}</div>
                      )}
                    </div>
                    {/* Optie-menu (kebab) voor eigen berichten */}
                    {m.sender_id === user.id && !editingId && (
                      <div className="message-options">
                        <button
                          className="kebab-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              activeMenuId === m.id ? null : m.id,
                            );
                          }}
                        >
                          ⋮
                        </button>
                        {activeMenuId === m.id && (
                          <div className="message-dropdown">
                            <button
                              className="dropdown-item"
                              onMouseDown={() => {
                                setEditingId(m.id);
                                setEditValue(m.message_text);
                                setActiveMenuId(null);
                              }}
                            >
                              Edit Message
                            </button>
                            <button
                              className="dropdown-item delete"
                              onMouseDown={() => deleteMessage(m.id)}
                            >
                              Delete Message
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            {/* Inputveld onderaan chat */}
            <form className="message-input-form" onSubmit={sendMessage}>
              <div className="input-wrapper">
                <input
                  placeholder={`Message @${selectedUser.username}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </form>
          </div>
        ) : (
          // FRIENDLIST / PENDING VENSTER (Home view)
          <div className="friends-container">
            <header className="top-bar">
              <div className="header-left">
                <span className="icon">👋</span>
                <span className="title">Friends</span>
                <div className="v-divider"></div>
                <button
                  className={`tab-link ${activeTab === "online" ? "active" : ""}`}
                  onClick={() => setActiveTab("online")}
                >
                  Friendlist
                </button>
                <button
                  className={`tab-link ${activeTab === "pending" ? "active" : ""}`}
                  onClick={() => setActiveTab("pending")}
                >
                  Pending{" "}
                  {pendingRequests.length > 0 && (
                    <span className="badge">{pendingRequests.length}</span>
                  )}
                </button>
                <button className="add-btn" onClick={handleAddFriend}>
                  Add Friend
                </button>
              </div>
            </header>
            <div className="friends-content">
              {activeTab === "online" ? (
                // Llijst met vrienden
                <>
                  <div className="search-bar-wrap">
                    <input className="friends-search" placeholder="Search" />
                  </div>
                  <div className="status-label">FRIENDS — {friends.length}</div>
                  <div className="list">
                    {friends.map((f: any) => (
                      <div
                        key={f.id}
                        className="friend-item"
                        onClick={() => setSelectedUser(f)}
                      >
                        <div className="f-info">
                          <div className="avatar">
                            {f.username[0].toUpperCase()}
                            <div className="status-dot online"></div>
                          </div>
                          <div className="f-text">
                            <div className="f-name">{f.username}</div>
                            <div className="f-status">Online</div>
                          </div>
                        </div>
                        <div
                          className="f-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="circle-btn"
                            onClick={() => setSelectedUser(f)}
                          >
                            💬
                          </button>
                          <button
                            className="circle-btn remove-btn-x"
                            onClick={() => removeFriend(f.id)}
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                // Lijst met inkomende verzoeken
                <>
                  <div className="status-label">
                    PENDING REQUESTS — {pendingRequests.length}
                  </div>
                  <div className="list">
                    {pendingRequests.length === 0 ? (
                      <div className="empty-state">
                        No pending friend requests.
                      </div>
                    ) : (
                      pendingRequests.map((r: any) => (
                        <div
                          key={r.friendship_id}
                          className="friend-item pending-item"
                        >
                          <div className="f-info">
                            <div className="avatar">
                              {r.username[0].toUpperCase()}
                            </div>
                            <div className="f-text">
                              <div className="f-name">{r.username}</div>
                              <div className="f-status">
                                Incoming Friend Request
                              </div>
                            </div>
                          </div>
                          <div className="f-actions">
                            <button
                              className="circle-btn accept-btn-v"
                              onClick={() => acceptRequest(r.friendship_id)}
                            >
                              ✅
                            </button>
                            <button
                              className="circle-btn remove-btn-x"
                              onClick={() => declineRequest(r.friendship_id)}
                            >
                              ❌
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
