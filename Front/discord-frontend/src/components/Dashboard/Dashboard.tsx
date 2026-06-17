import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axiosInstance";
import "./Dashboard.css";

const Dashboard = ({ user, onLogout }: any) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  // Deze lijst houdt bij wie er in je zijbalk staat, onafhankelijk van je vriendenlijst
  const [chatParticipants, setChatParticipants] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"online" | "pending">("online");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const loadFriendsAndRequests = async () => {
    try {
      const friendsRes = await api.get(`/friends/${user.id}`);
      setFriends(friendsRes.data);

      // Update de chat-deelnemers: voeg vrienden toe aan de lijst als ze er nog niet in staan
      setChatParticipants((prev) => {
        const newList = [...prev];
        friendsRes.data.forEach((f: any) => {
          if (!newList.find((p) => p.id === f.id)) newList.push(f);
        });
        return newList;
      });

      const pendingRes = await api.get(`/friends/pending/${user.id}`);
      setPendingRequests(pendingRes.data);
    } catch (err) {
      console.error("Fout bij ophalen vrienden/verzoeken", err);
    }
  };

  useEffect(() => {
    loadFriendsAndRequests();
  }, [user.id]);

  useEffect(() => {
    const fetchData = () => {
      if (selectedUser && editingId === null) {
        api
          .get(`/messages/${user.id}/${selectedUser.id}`)
          .then((res) => setChatHistory(res.data))
          .catch(() => console.log("Chat kon niet geladen worden"));
      }
      loadFriendsAndRequests();
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [selectedUser, user.id, editingId]);

  const handleAddFriend = async () => {
    const friendUsername = window.prompt(
      "Geef de gebruikersnaam van je vriend:",
    );
    if (!friendUsername || !friendUsername.trim()) return;
    try {
      const res = await api.post("/friends/add", {
        userId: user.id,
        friendUsername: friendUsername.trim(),
      });
      alert(res.data.message);
      loadFriendsAndRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || "Er is iets misgegaan.");
    }
  };

  const removeFriend = async (friendId: number) => {
    if (!window.confirm("Weet je zeker dat je deze vriend wilt verwijderen?"))
      return;
    try {
      await api.delete(`/friends/${user.id}/${friendId}`);
      // Verwijder uit de 'friends' lijst (zodat ze uit de Friendlist tab verdwijnen)
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
      // MAAR: Verwijder ze NIET uit chatParticipants, zodat de chat behouden blijft
      alert("Vriend verwijderd. De chat blijft in je zijbalk staan.");
    } catch (err) {
      console.error("Verwijderen mislukt:", err);
    }
  };

  const acceptRequest = async (friendshipId: number) => {
    try {
      await api.put(`/friends/accept/${friendshipId}`);
      loadFriendsAndRequests();
    } catch (err) {
      console.error("Accepteren mislukt", err);
    }
  };

  const declineRequest = async (friendshipId: number) => {
    try {
      await api.delete(`/friends/decline/${friendshipId}`);
      setPendingRequests((prev) =>
        prev.filter((r) => r.friendship_id !== friendshipId),
      );
    } catch (err) {
      console.error("Weigeren mislukt", err);
    }
  };

  const deleteMessage = async (id: number) => {
    try {
      await api.delete(`/messages/${id}`);
      setChatHistory((prev) => prev.filter((m: any) => m.id !== id));
      setActiveMenuId(null);
    } catch (err) {
      console.error("Verwijderen mislukt");
    }
  };

  const saveEdit = async (id: number) => {
    const trimmedValue = editValue.trim();
    if (!trimmedValue) {
      setEditingId(null);
      return;
    }
    try {
      await api.put(`/messages/${id}`, { message_text: trimmedValue });
      setChatHistory((prev) =>
        prev.map((m: any) =>
          m.id === id ? { ...m, message_text: trimmedValue } : m,
        ),
      );
      setEditingId(null);
    } catch (err) {
      console.error("Bewerken mislukt");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;
    try {
      const res = await api.post("/messages", {
        sender_id: user.id,
        receiver_id: selectedUser.id,
        message_text: message,
      });
      setChatHistory((prev) => [...prev, res.data]);
      setMessage("");
    } catch (err) {
      console.error("Verzenden mislukt");
    }
  };

  return (
    <div className="discord-layout">
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
          {/* Gebruik chatParticipants in de zijbalk */}
          {chatParticipants.map((f: any) => (
            <div
              key={f.id}
              className={`user-item ${selectedUser?.id === f.id ? "active" : ""}`}
              onClick={() => setSelectedUser(f)}
            >
              <div className="avatar">
                {f.username[0].toUpperCase()}
                <div className="status-dot online"></div>
              </div>
              <span className="username">{f.username}</span>
            </div>
          ))}
        </div>
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

      <main className="main-view">
        {selectedUser ? (
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
                        </div>
                      ) : (
                        <div className="message-text">{m.message_text}</div>
                      )}
                    </div>
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
          <div className="friends-container">
            {/* ... de rest van je render code voor vriendenlijst blijft hetzelfde ... */}
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
                <>
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
                          </div>
                          <div className="f-text">
                            <div className="f-name">{f.username}</div>
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
                <>
                  <div className="status-label">
                    PENDING REQUESTS — {pendingRequests.length}
                  </div>
                  <div className="list">
                    {pendingRequests.map((r: any) => (
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
                    ))}
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
