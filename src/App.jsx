import { useState, useEffect, useRef } from "react";

const THEMES = {
  fire: { primary: "#ff4500", secondary: "#ff8c00", bg: "#0a0500", text: "#fff8f0", accent: "#ffcc00" },
  ocean: { primary: "#00b4d8", secondary: "#0077b6", bg: "#03045e", text: "#caf0f8", accent: "#90e0ef" },
  neon: { primary: "#39ff14", secondary: "#ff00ff", bg: "#0d0d0d", text: "#ffffff", accent: "#00ffff" },
  gold: { primary: "#ffd700", secondary: "#b8860b", bg: "#1a1200", text: "#fff8dc", accent: "#ffec8b" },
  rose: { primary: "#ff69b4", secondary: "#c71585", bg: "#1a0010", text: "#fff0f5", accent: "#ffb6c1" },
};

const ANIMATIONS = {
  confetti: "🎊",
  fireworks: "🎆",
  sparkle: "✨",
  stars: "⭐",
  none: "—",
};

function ConfettiCanvas({ active, colors }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    particles.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 4 + 2,
      drift: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 5 - 2.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        ctx.restore();
        p.y += p.speed;
        p.x += p.drift;
        p.rotation += p.rotSpeed;
      });
      particles.current = particles.current.filter((p) => p.y < canvas.height + 20);
      if (particles.current.length > 0) animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, colors]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 10,
      }}
    />
  );
}

function RafflePreview({ config }) {
  const theme = THEMES[config.theme] || THEMES.fire;
  const [timeLeft, setTimeLeft] = useState(config.countdown * 60);
  const [showConfetti, setShowConfetti] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    setTimeLeft(config.countdown * 60);
    setDrawn(false);
    setWinners([]);
  }, [config.countdown]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const drawWinners = () => {
    const names = config.participants.split(",").map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) return;
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    setWinners(shuffled.slice(0, Math.min(config.winnerCount, names.length)));
    setDrawn(true);
    if (config.animation !== "none") setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  return (
    <div style={{
      background: theme.bg,
      borderRadius: 20,
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
      border: `2px solid ${theme.primary}44`,
      boxShadow: `0 0 40px ${theme.primary}22`,
      minHeight: 420,
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <ConfettiCanvas active={showConfetti} colors={[theme.primary, theme.secondary, theme.accent, "#fff"]} />

      <div style={{
        position: "absolute", top: -60, right: -60, width: 200, height: 200,
        borderRadius: "50%", background: `radial-gradient(circle, ${theme.primary}33, transparent)`,
        pointerEvents: "none",
      }} />

      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 40 }}>{config.emoji || "🎁"}</div>
        <h2 style={{
          color: theme.text, fontSize: "1.6rem", fontWeight: 800,
          margin: "0.4rem 0 0.2rem", textShadow: `0 0 20px ${theme.primary}88`,
        }}>
          {config.title || "Meine Verlosung"}
        </h2>
        <p style={{ color: theme.accent, fontSize: "0.9rem", margin: 0, opacity: 0.85 }}>
          {config.subtitle || "Mach mit und gewinne!"}
        </p>
      </div>

      {config.prize && (
        <div style={{
          background: `${theme.primary}18`,
          border: `1px solid ${theme.primary}44`,
          borderRadius: 12,
          padding: "0.8rem 1.2rem",
          marginBottom: "1rem",
          textAlign: "center",
        }}>
          <div style={{ color: theme.accent, fontSize: "0.75rem", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Hauptgewinn</div>
          <div style={{ color: theme.text, fontWeight: 700, fontSize: "1.1rem" }}>{config.prize}</div>
        </div>
      )}

      {config.showCountdown && (
        <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
          <div style={{ color: theme.primary, fontSize: "0.75rem", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
            Endet in
          </div>
          <div style={{ display: "inline-flex", gap: 8 }}>
            {[mins, secs].map((v, i) => (
              <div key={i} style={{
                background: `${theme.primary}22`,
                border: `1px solid ${theme.primary}55`,
                borderRadius: 8, padding: "0.4rem 0.8rem",
                color: theme.primary, fontWeight: 900, fontSize: "1.6rem",
                fontVariantNumeric: "tabular-nums",
                textShadow: `0 0 12px ${theme.primary}`,
                minWidth: 52, textAlign: "center",
              }}>{v}</div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: "1.2rem" }}>
        <div style={{
          background: `${theme.secondary}22`, border: `1px solid ${theme.secondary}44`,
          borderRadius: 20, padding: "4px 14px",
          color: theme.text, fontSize: "0.82rem",
        }}>
          🏆 {config.winnerCount} Gewinner
        </div>
        <div style={{
          background: `${theme.accent}22`, border: `1px solid ${theme.accent}44`,
          borderRadius: 20, padding: "4px 14px",
          color: theme.text, fontSize: "0.82rem",
        }}>
          {ANIMATIONS[config.animation]} {config.animation}
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button onClick={drawWinners} style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          color: "#fff", border: "none", borderRadius: 50,
          padding: "0.8rem 2.5rem", fontWeight: 800, fontSize: "1rem",
          cursor: "pointer", letterSpacing: 1,
          boxShadow: `0 4px 20px ${theme.primary}66`,
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.06)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          🎰 Gewinner ziehen
        </button>
      </div>

      {drawn && winners.length > 0 && (
        <div style={{
          background: `${theme.accent}15`, border: `1px solid ${theme.accent}44`,
          borderRadius: 12, padding: "1rem",
          animation: "fadeIn 0.5s ease",
        }}>
          <div style={{ color: theme.accent, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>
            🎉 Gewinner!
          </div>
          {winners.map((w, i) => (
            <div key={i} style={{
              color: theme.text, textAlign: "center",
              padding: "4px 0", fontSize: "1rem", fontWeight: 600,
            }}>
              {i + 1}. {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatBubble({ role, text }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: role === "user" ? "flex-end" : "flex-start",
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: "82%",
        background: role === "user"
          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
          : "#1e1e2e",
        color: "#fff",
        borderRadius: role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "10px 16px",
        fontSize: "0.88rem",
        lineHeight: 1.5,
        border: role === "assistant" ? "1px solid #333" : "none",
      }}>
        {text}
      </div>
    </div>
  );
}

export default function AIRaffleBuilder() {
  const [config, setConfig] = useState({
    title: "PS5 Bundle Verlosung",
    subtitle: "Mach mit und gewinne ein PS5-Bundle!",
    prize: "PlayStation 5 + 3 Spiele",
    emoji: "🎮",
    theme: "neon",
    animation: "confetti",
    winnerCount: 2,
    countdown: 10,
    showCountdown: true,
    participants: "Alice, Bob, Carol, Dave, Eve, Frank, Greta",
  });

  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey! 👋 Beschreib mir deine Verlosung – ich passe alles automatisch an. Zum Beispiel: \"Mach eine Verlosung für ein iPhone mit Golddesign und 3 Gewinnern\"" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `Du bist ein Assistent der hilft, Verlosungs-Konfigurationen zu erstellen.
Der Nutzer beschreibt seine Wunschverlosung in natürlicher Sprache.
Du antwortest AUSSCHLIESSLICH mit einem rohen JSON-Objekt. KEINE Backticks, KEIN Markdown, KEIN erklärender Text außerhalb des JSON.
Das JSON muss ALLE diese Felder enthalten:
{"title":"Titel","subtitle":"Untertitel","prize":"Gewinn","emoji":"🎁","theme":"fire","animation":"confetti","winnerCount":1,"countdown":10,"showCountdown":true,"message":"Was ich geändert habe"}
Erlaubte theme-Werte: fire, ocean, neon, gold, rose
Erlaubte animation-Werte: confetti, fireworks, sparkle, stars, none
winnerCount und countdown MÜSSEN Zahlen (integers) sein, nicht Strings.
showCountdown MUSS boolean sein.
Wähle theme und animation passend zum Kontext. Sei kreativ!`,
          messages: [{ role: "user", content: userMsg }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.[0]?.text || "{}";
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : {};
      }

      const { message, ...newConfig } = parsed;
      if (newConfig.winnerCount) newConfig.winnerCount = Number(newConfig.winnerCount);
      if (newConfig.countdown) newConfig.countdown = Number(newConfig.countdown);
      if (typeof newConfig.showCountdown === "string") newConfig.showCountdown = newConfig.showCountdown === "true";
      setConfig((prev) => ({ ...prev, ...newConfig }));
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: message || "✅ Deine Verlosung wurde aktualisiert!",
      }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: "❌ Fehler beim Verbinden mit der KI. Bitte versuche es erneut.",
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a14",
      color: "#fff",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "1.5rem",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            fontSize: "1.8rem", fontWeight: 900, margin: 0,
            background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            🎰 AI Raffle Builder
          </h1>
          <p style={{ color: "#666", marginTop: 6, fontSize: "0.9rem" }}>
            Beschreibe deine Verlosung – die KI passt alles in Echtzeit an
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Left: Chat */}
          <div style={{
            background: "#111120",
            borderRadius: 20,
            border: "1px solid #222",
            display: "flex", flexDirection: "column",
            height: 580,
          }}>
            <div style={{
              padding: "1rem 1.2rem",
              borderBottom: "1px solid #1e1e30",
              fontWeight: 700, fontSize: "0.9rem", color: "#a855f7",
              letterSpacing: 1,
            }}>
              💬 KI-Assistent
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
              {messages.map((m, i) => (
                <ChatBubble key={i} role={m.role} text={m.text} />
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 4, padding: "8px 16px" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#a855f7",
                      animation: `pulse 1s ease ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{
              padding: "0.8rem 1rem",
              borderTop: "1px solid #1e1e30",
              display: "flex", gap: 8,
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="z.B. iPhone-Verlosung mit 3 Gewinnern, blau..."
                style={{
                  flex: 1, background: "#1a1a2e", border: "1px solid #333",
                  borderRadius: 50, padding: "0.6rem 1rem",
                  color: "#fff", fontSize: "0.88rem", outline: "none",
                }}
              />
              <button onClick={sendMessage} disabled={loading} style={{
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                border: "none", borderRadius: 50, padding: "0.6rem 1.2rem",
                color: "#fff", fontWeight: 700, cursor: "pointer",
                fontSize: "0.88rem", opacity: loading ? 0.5 : 1,
              }}>
                ➤
              </button>
            </div>

            <div style={{ padding: "0 1rem 1rem", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                "PS5 Bundle, neon, 2 Gewinner",
                "iPhone gold, luxus",
                "Reise nach Malibu 🌊",
                "Gaming-PC, feuer, 1 Gewinner",
              ].map((s) => (
                <button key={s} onClick={() => setInput(s)} style={{
                  background: "#1a1a2e", border: "1px solid #333",
                  borderRadius: 20, padding: "3px 10px",
                  color: "#888", fontSize: "0.75rem", cursor: "pointer",
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div>
            <div style={{
              color: "#666", fontSize: "0.8rem", letterSpacing: 2,
              textTransform: "uppercase", marginBottom: "0.8rem",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
                animation: "pulse 2s infinite",
              }} />
              Live Preview
            </div>
            <RafflePreview config={config} />

            <div style={{ marginTop: "1rem" }}>
              <label style={{ color: "#555", fontSize: "0.8rem", display: "block", marginBottom: 4 }}>
                Teilnehmer (kommagetrennt)
              </label>
              <textarea
                value={config.participants}
                onChange={(e) => setConfig((p) => ({ ...p, participants: e.target.value }))}
                rows={2}
                style={{
                  width: "100%", background: "#111120", border: "1px solid #222",
                  borderRadius: 10, padding: "0.6rem", color: "#aaa",
                  fontSize: "0.82rem", resize: "none", outline: "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
