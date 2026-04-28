import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Shield, Terminal, FileText, Check, X } from 'lucide-react';

const API_BASE = "/api/v1"; 

export default function Chat({ currentUser, initialContact }) {
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(initialContact);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  // SPRING BOOT: Fetch conversation history
  useEffect(() => {
    fetch(`${API_BASE}/network/conversations/${currentUser.username}`)
      .then(res => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
      })
      .then(data => {
        const filtered = data.filter(c => c !== currentUser.username);
        setConversations(filtered);
        
        if (initialContact && initialContact !== currentUser.username && !filtered.includes(initialContact)) {
            setConversations(prev => [initialContact, ...prev]);
        }
      })
      .catch(err => console.log("Waiting for conversations payload..."));
  }, [currentUser.username, initialContact]);

  // --- THE POLLING FIX (Fakes Real-Time Chat) ---
  useEffect(() => {
    if (!activeContact || activeContact === currentUser.username) {
      if (activeContact === currentUser.username) setActiveContact(null);
      return;
    }

    const fetchMessages = () => {
      fetch(`${API_BASE}/network/messages/${currentUser.username}/${activeContact}`)
        .then(res => res.json())
        .then(setMessages)
        .catch(err => console.error("Failed to fetch messages:", err));
    };

    // 1. Fetch immediately when clicking contact
    fetchMessages();

    // 2. Poll the MySQL database every 3 seconds for new packets
    const intervalId = setInterval(fetchMessages, 3000);

    // 3. Cleanup timer when closing chat
    return () => clearInterval(intervalId);
  }, [activeContact, currentUser.username]);
  // ----------------------------------------------

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // SPRING BOOT: Send the message via POST
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const msgData = {
      senderId: currentUser.username,
      receiverId: activeContact,
      content: newMessage
    };

    try {
      const response = await fetch(`${API_BASE}/network/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(msgData)
      });

      if (response.ok) {
        const savedMessage = await response.json();
        setMessages(prev => {
            // Prevent duplicate message bubbles if polling catches it at the same time
            if (prev.some(m => m.id === savedMessage.id)) return prev;
            return [...prev, savedMessage];
        });
        setNewMessage('');
      }
    } catch (error) {
      console.error("Packet transmission failed:", error);
    }
  };

  return (
    <div className="chat-interface fade-in">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <Terminal size={16} color="var(--d-orange)" />
          <span>FREQUENCY_LIST</span>
        </div>
        <div className="conversations-list">
          {conversations.length === 0 && (
            <div className="empty-state">NO ACTIVE SPECTRA</div>
          )}
          {conversations.map(contact => (
            <div 
              key={contact} 
              className={`conversation-item ${activeContact === contact ? 'active' : ''}`}
              onClick={() => setActiveContact(contact)}
            >
              <div className="user-avatar">
                <User size={14} />
              </div>
              <div className="conversation-info">
                <div className="contact-name">{contact}</div>
                <div className="last-status">ENCRYPTED_CHANNEL</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-window">
        {activeContact ? (
          <>
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Shield size={18} color="var(--d-orange)" />
                <div>
                  <div className="active-contact-name">{activeContact}</div>
                  <div className="connection-status">STABLE_TUNNEL</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="encryption-badge">AES-256-GCM</div>
              </div>
            </div>

            <div className="messages-container" ref={scrollRef}>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message-bubble ${msg.senderId === currentUser.username ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="> Transmit packets..." 
                className="glass-input chat-input" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="role-btn primary send-btn">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder">
            <h2 style={{ opacity: 0.5 }}>SELECT A TARGET TO INITIATE HANDSHAKE</h2>
          </div>
        )}
      </div>
    </div>
  );
}