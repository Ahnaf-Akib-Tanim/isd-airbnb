import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import messageService from "../services/messageService";
import userService from "../services/userService";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import "./InboxPage.css";

const InboxPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedUserId = searchParams.get("with");

  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login");
  }, [loading, isAuthenticated, navigate]);

  // Load conversations list
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.userId) return;
      try {
        const data = await messageService.getConversations();
        const convos = data.conversations || [];
        setConversations(convos);

        // If ?with=userId is in URL, auto-select that conversation
        if (preselectedUserId) {
          setSelectedUserId(preselectedUserId);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoadingConversations(false);
      }
    };
    loadConversations();
  }, [user, preselectedUserId]);

  // Load messages when a conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUserId) return;
      setLoadingMessages(true);
      try {
        const [msgs, profile] = await Promise.all([
          messageService.getMessageHistory(selectedUserId),
          userService.getUserProfile(selectedUserId),
        ]);
        setMessages(msgs || []);
        setSelectedUser(profile);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [selectedUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const sent = await messageService.sendMessage(selectedUserId, newMessage.trim());
      setMessages((prev) => [...prev, sent]);
      setNewMessage("");

      // Update conversation list with latest message
      setConversations((prev) => {
        const exists = prev.some((c) => {
          const otherId = c.senderId === user.userId ? c.receiverId : c.senderId;
          return otherId === selectedUserId;
        });
        if (exists) {
          return prev.map((c) => {
            const otherId = c.senderId === user.userId ? c.receiverId : c.senderId;
            return otherId === selectedUserId ? sent : c;
          });
        }
        return [sent, ...prev];
      });
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherUser = (msg) => {
    if (msg.senderId === user?.userId) {
      return {
        id: msg.receiverId,
        name: msg.receiverName,
        image: msg.receiverProfileImage,
        role: msg.receiverRole,
      };
    }
    return {
      id: msg.senderId,
      name: msg.senderName,
      image: msg.senderProfileImage,
      role: msg.senderRole,
    };
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (loading) return <div className="inbox-loading">Loading...</div>;

  return (
    <>
      <div className="inbox-page">
        {/* Sidebar: Conversation list */}
        <div className="inbox-sidebar">
        <div className="inbox-sidebar__header">
          <h2>Messages</h2>
        </div>
        <div className="inbox-sidebar__list">
          {loadingConversations ? (
            <div className="inbox-sidebar__empty">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="inbox-sidebar__empty">
              <p>No messages yet</p>
              <span>Start a conversation by messaging a host from their listing page.</span>
            </div>
          ) : (
            conversations.map((msg, idx) => {
              const other = getOtherUser(msg);
              const isActive = other.id === selectedUserId;
              return (
                <button
                  key={idx}
                  className={`inbox-convo ${isActive ? "inbox-convo--active" : ""}`}
                  onClick={() => setSelectedUserId(other.id)}
                >
                  <div className="inbox-convo__avatar">
                    {other.image ? (
                      <img src={other.image} alt={other.name} />
                    ) : (
                      <span>{other.name?.charAt(0) || "?"}</span>
                    )}
                  </div>
                  <div className="inbox-convo__info">
                    <div className="inbox-convo__top">
                      <span className="inbox-convo__name">{other.name}</span>
                      <span className="inbox-convo__time">{formatTime(msg.timestamp)}</span>
                    </div>
                    <p className="inbox-convo__preview">
                      {msg.senderId === user?.userId ? "You: " : ""}
                      {msg.content?.length > 40 ? msg.content.slice(0, 40) + "…" : msg.content}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="inbox-chat">
        {!selectedUserId ? (
          <div className="inbox-chat__empty">
            <div className="inbox-chat__empty-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose from your existing conversations or start a new one.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="inbox-chat__header">
              {selectedUser && (
                <>
                  <div className="inbox-chat__header-avatar">
                    {selectedUser.profileImage ? (
                      <img src={selectedUser.profileImage} alt={selectedUser.firstName} />
                    ) : (
                      <span>{selectedUser.firstName?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="inbox-chat__header-info">
                    <h3>{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <span className="inbox-chat__header-role">{selectedUser.role}</span>
                  </div>
                  <button
                    className="inbox-chat__view-profile"
                    onClick={() => navigate(`/rooms/${selectedUserId}`)}
                  >
                    View Profile
                  </button>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="inbox-chat__messages">
              {loadingMessages ? (
                <div className="inbox-chat__loading">
                  <div className="dot-flashing"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="inbox-chat__no-messages" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <svg viewBox="0 0 32 32" width="64" height="64" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M26 4H6a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM8 12h16M8 18h10"></path>
                  </svg>
                  <p>No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === user?.userId;
                  return (
                    <div
                      key={idx}
                      className={`inbox-msg ${isMine ? "inbox-msg--sent" : "inbox-msg--received"}`}
                    >
                      {!isMine && (
                        <div className="inbox-msg__avatar">
                          {msg.senderProfileImage ? (
                            <img src={msg.senderProfileImage} alt="" />
                          ) : (
                            <span>{msg.senderName?.charAt(0)}</span>
                          )}
                        </div>
                      )}
                      <div className="inbox-msg__bubble shadow-sm">
                        <p>{msg.content}</p>
                        <span className="inbox-msg__time">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="inbox-chat__input">
              <button className="inbox-chat__attach-btn" disabled>
                <svg viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style={{fill: "none", height: "20px", width: "20px", stroke: "currentColor", strokeWidth: "2", overflow: "visible"}}>
                  <path d="M16 4v24M4 16h24"></path>
                </svg>
              </button>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
              />
              <button
                className="inbox-chat__send"
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default InboxPage;
