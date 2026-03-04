import React, { useState, useRef, useEffect } from "react";

// ─── Chatbot Component ───────────────────────────────────────────────────────
function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hey there! 🎸 I'm your guitar assistant. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.response || "Sorry, I didn't get that." }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "⚠️ Server unavailable. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');

        .chat-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 62px;
          height: 62px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          z-index: 9999;
          background: linear-gradient(135deg, #0ff 0%, #f0f 100%);
          box-shadow: 0 0 20px rgba(0,255,255,0.6), 0 0 40px rgba(255,0,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: fabPulse 2.5s ease-in-out infinite;
        }
        .chat-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(0,255,255,0.9), 0 0 60px rgba(255,0,255,0.5);
        }
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,255,0.6), 0 0 40px rgba(255,0,255,0.3); }
          50%       { box-shadow: 0 0 35px rgba(0,255,255,1),   0 0 70px rgba(255,0,255,0.6); }
        }
        .chat-fab-icon { font-size: 26px; filter: drop-shadow(0 0 4px #000); }

        .chat-badge {
          position: absolute;
          top: 2px; right: 2px;
          background: #ff003c;
          color: #fff;
          border-radius: 50%;
          width: 20px; height: 20px;
          font-size: 10px;
          font-family: 'Orbitron', monospace;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #000;
          box-shadow: 0 0 8px #ff003c;
        }

        .chat-window {
          position: fixed;
          bottom: 108px;
          right: 32px;
          width: 370px;
          height: 520px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
          animation: slideUp 0.28s cubic-bezier(.22,1,.36,1);
          background: #050510;
          border: 1px solid rgba(0,255,255,0.25);
          box-shadow:
            0 0 0 1px rgba(0,255,255,0.1),
            0 20px 60px rgba(0,0,0,0.8),
            inset 0 0 80px rgba(0,255,255,0.03);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Scanline effect */
        .chat-window::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,255,255,0.015) 2px,
            rgba(0,255,255,0.015) 4px
          );
          pointer-events: none;
          z-index: 1;
          border-radius: 16px;
        }

        .chat-header {
          background: linear-gradient(135deg, #080820 0%, #0a0a25 100%);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0,255,255,0.2);
          position: relative;
          z-index: 2;
        }
        .chat-header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #0ff, #f0f, transparent);
        }

        .chat-header-left { display: flex; align-items: center; gap: 10px; }

        .chat-avatar-wrap {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(0,255,255,0.15), rgba(255,0,255,0.15));
          border: 1px solid rgba(0,255,255,0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 12px rgba(0,255,255,0.3);
          animation: avatarGlow 3s ease-in-out infinite;
        }
        @keyframes avatarGlow {
          0%,100% { box-shadow: 0 0 12px rgba(0,255,255,0.3); }
          50%      { box-shadow: 0 0 22px rgba(0,255,255,0.7), 0 0 40px rgba(255,0,255,0.3); }
        }

        .chat-bot-name {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 13px;
          color: #0ff;
          letter-spacing: 1.5px;
          text-shadow: 0 0 8px rgba(0,255,255,0.8);
        }
        .chat-bot-status {
          display: flex; align-items: center; gap: 5px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px;
          color: #4ade80;
          letter-spacing: 0.5px;
        }
        .status-dot {
          width: 6px; height: 6px;
          background: #4ade80;
          border-radius: 50%;
          box-shadow: 0 0 6px #4ade80;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0.4; }
        }

        .chat-close-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #888;
          cursor: pointer;
          font-size: 14px;
          width: 28px; height: 28px;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .chat-close-btn:hover { color: #0ff; border-color: rgba(0,255,255,0.4); background: rgba(0,255,255,0.05); }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          z-index: 2;
          scrollbar-width: thin;
          scrollbar-color: rgba(0,255,255,0.2) transparent;
        }

        .msg-row { display: flex; align-items: flex-end; gap: 8px; }
        .msg-row.user { justify-content: flex-end; }
        .msg-row.bot  { justify-content: flex-start; }

        .msg-bot-avatar { font-size: 16px; flex-shrink: 0; margin-bottom: 2px; }

        .bubble {
          max-width: 78%;
          padding: 10px 14px;
          border-radius: 14px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.5;
          word-break: break-word;
          letter-spacing: 0.3px;
        }
        .bubble.user {
          background: linear-gradient(135deg, rgba(0,255,255,0.15), rgba(255,0,255,0.15));
          color: #e0f7ff;
          border: 1px solid rgba(0,255,255,0.3);
          border-bottom-right-radius: 4px;
          box-shadow: 0 0 12px rgba(0,255,255,0.1);
        }
        .bubble.bot {
          background: rgba(255,255,255,0.04);
          color: #c8e6ff;
          border: 1px solid rgba(255,255,255,0.08);
          border-bottom-left-radius: 4px;
        }

        .typing-bubble {
          display: flex; gap: 5px; align-items: center;
          padding: 12px 16px;
        }
        .typing-dot {
          width: 7px; height: 7px;
          background: #0ff;
          border-radius: 50%;
          box-shadow: 0 0 6px #0ff;
          animation: typingBounce 1.2s ease-in-out infinite;
        }
        @keyframes typingBounce {
          0%,80%,100% { transform: translateY(0); opacity: 0.5; }
          40%          { transform: translateY(-7px); opacity: 1; }
        }

        .chat-input-area {
          display: flex;
          gap: 8px;
          padding: 12px 14px;
          border-top: 1px solid rgba(0,255,255,0.15);
          background: rgba(0,0,0,0.4);
          position: relative;
          z-index: 2;
        }
        .chat-input-area::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,255,255,0.4), transparent);
        }

        .chat-input {
          flex: 1;
          background: rgba(0,255,255,0.05);
          border: 1px solid rgba(0,255,255,0.2);
          border-radius: 10px;
          padding: 10px 14px;
          color: #e0f7ff;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          letter-spacing: 0.3px;
        }
        .chat-input::placeholder { color: rgba(0,255,255,0.3); }
        .chat-input:focus {
          border-color: rgba(0,255,255,0.5);
          box-shadow: 0 0 12px rgba(0,255,255,0.15);
        }

        .chat-send-btn {
          background: linear-gradient(135deg, #0ff, #f0f);
          border: none;
          border-radius: 10px;
          width: 42px; height: 42px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 12px rgba(0,255,255,0.4);
        }
        .chat-send-btn:not(:disabled):hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(0,255,255,0.7);
        }
        .chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* FAB Button */}
      <button className="chat-fab" onClick={() => setIsOpen(o => !o)} aria-label="Toggle chat">
        {isOpen ? (
          <span className="chat-fab-icon">✕</span>
        ) : (
          <span className="chat-fab-icon">🎸</span>
        )}
        {!isOpen && messages.length > 1 && (
          <span className="chat-badge">{messages.filter(m => m.role === "bot").length}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar-wrap">🎸</div>
              <div>
                <div className="chat-bot-name">GUITAR·AI</div>
                <div className="chat-bot-status">
                  <span className="status-dot" /> ONLINE
                </div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.role}`}>
                {msg.role === "bot" && <span className="msg-bot-avatar">🤖</span>}
                <div className={`bubble ${msg.role}`}>{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg-row bot">
                <span className="msg-bot-avatar">🤖</span>
                <div className="bubble bot typing-bubble">
                  <span className="typing-dot" style={{ animationDelay: "0s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.2s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about guitars..."
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Home Page ───────────────────────────────────────────────────────────────
export default function Home({ onShopClick }) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{
        backgroundImage: "url('/images/guitar10.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome to GuitarHub</h1>
          <p>Discover the finest guitars from the world's best brands</p>
          <button className="hero-btn" onClick={onShopClick}>
            Start Shopping 🎸
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="feature-card">
            <span className="feature-icon">⭐</span>
            <h3>Premium Quality</h3>
            <p>Handpicked guitars from renowned brands</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚚</span>
            <h3>Fast Shipping</h3>
            <p>Quick delivery to your favorite location</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💯</span>
            <h3>Guaranteed</h3>
            <p>100% authentic instruments with warranty</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎵</span>
            <h3>Expert Support</h3>
            <p>Get advice from guitar enthusiasts</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Find Your Perfect Guitar Today</h2>
        <button className="cta-btn" onClick={onShopClick}>
          Explore Our Collection
        </button>
      </section>

      {/* 🤖 Chatbot - floats on bottom right */}
      <Chatbot />
    </div>
  );
}