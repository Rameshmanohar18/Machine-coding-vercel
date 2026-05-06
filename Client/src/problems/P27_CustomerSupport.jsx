/**
 * PROBLEM 27 — Customer Support Chat Widget
 * Asked at: Freshworks, Zoho, Intercom, Zendesk
 *
 * Requirements:
 * - Floating chat widget (open/close)
 * - Bot auto-replies with typing indicator
 * - Suggested quick replies
 * - Conversation history
 * - File attachment simulation
 * - Satisfaction rating after resolution
 * - Agent handoff simulation
 * - Minimize / maximize
 */

import { useState, useRef, useEffect, useCallback } from "react";

const BOT_FLOWS = {
  default: {
    reply: "Hi! 👋 I'm the support assistant. How can I help you today?",
    suggestions: ["Track my order", "Return/Refund", "Technical issue", "Billing query"]
  },
  "Track my order": {
    reply: "Sure! Please share your order ID and I'll look it up right away.",
    suggestions: ["My order is delayed", "Order not received", "Wrong item delivered"]
  },
  "Return/Refund": {
    reply: "I can help with returns! Our return window is 30 days. Would you like to initiate a return?",
    suggestions: ["Yes, start return", "Check refund status", "Talk to agent"]
  },
  "Technical issue": {
    reply: "I'm sorry you're facing a technical issue. Can you describe the problem?",
    suggestions: ["App not loading", "Payment failed", "Login issue", "Talk to agent"]
  },
  "Billing query": {
    reply: "For billing queries, I'll need to verify your account. Can you share your registered email?",
    suggestions: ["Incorrect charge", "Invoice request", "Talk to agent"]
  },
  "Talk to agent": {
    reply: "Connecting you to a live agent... 🔄 Agent Priya will join in ~2 minutes.",
    suggestions: ["Cancel", "Leave a message"]
  },
  "Yes, start return": {
    reply: "Return initiated! ✅ You'll receive a pickup confirmation within 24 hours. Refund in 5-7 days.",
    suggestions: ["Track return", "Rate this chat"]
  },
  "Rate this chat": {
    reply: "Thank you for chatting with us! Please rate your experience.",
    suggestions: [], rating: true
  },
};

let msgId = 1;

export default function CustomerSupport() {
  const [open,     setOpen]     = useState(false);
  const [minimized,setMinimized]= useState(false);
  const [messages, setMessages] = useState([
    { id:msgId++, from:"bot", text:BOT_FLOWS.default.reply, time:new Date().toLocaleTimeString() }
  ]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [suggestions, setSuggestions] = useState(BOT_FLOWS.default.suggestions);
  const [showRating, setShowRating]   = useState(false);
  const [rated,    setRated]    = useState(null);
  const [unread,   setUnread]   = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) setUnread(0);
  }, [open]);

  const botReply = useCallback((userText) => {
    const flow = BOT_FLOWS[userText] || {
      reply: "I understand. Let me check that for you... Is there anything else I can help with?",
      suggestions: ["Track my order", "Talk to agent", "Rate this chat"]
    };

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const msg = { id:msgId++, from:"bot", text:flow.reply, time:new Date().toLocaleTimeString() };
      setMessages(m => [...m, msg]);
      setSuggestions(flow.suggestions || []);
      if (flow.rating) setShowRating(true);
      if (!open) setUnread(u => u+1);
    }, 1200 + Math.random()*800);
  }, [open]);

  const send = useCallback((text) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { id:msgId++, from:"user", text, time:new Date().toLocaleTimeString() }]);
    setInput("");
    setSuggestions([]);
    botReply(text);
  }, [botReply]);

  const rate = (stars) => {
    setRated(stars);
    setMessages(m => [...m, {
      id:msgId++, from:"bot",
      text:`Thank you for rating us ${stars} star${stars>1?"s":""}! ${"⭐".repeat(stars)} We're glad to help.`,
      time:new Date().toLocaleTimeString()
    }]);
    setShowRating(false);
    setSuggestions([]);
  };

  return (
    <div className="card">
      <h2 className="card-title">💬 Customer Support Chat Widget</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Freshworks, Zoho, Intercom.</strong> Floating chat widget, bot auto-replies
        with typing indicator, quick reply suggestions, agent handoff, satisfaction rating.
      </p>

      {/* Demo area */}
      <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)", borderRadius:"var(--r3)",
        padding:"var(--s8)", minHeight:300, position:"relative", display:"flex",
        alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", color:"var(--t3)" }}>
          <div style={{ fontSize:48, marginBottom:"var(--s3)" }}>🛍</div>
          <div style={{ fontWeight:700, color:"var(--t1)", marginBottom:"var(--s2)" }}>Demo E-Commerce Page</div>
          <div style={{ fontSize:"var(--sm)" }}>Click the chat button to open support</div>
        </div>

        {/* Chat widget */}
        <div style={{ position:"absolute", bottom:20, right:20 }}>
          {/* Chat window */}
          {open && !minimized && (
            <div style={{
              position:"absolute", bottom:60, right:0,
              width:320, height:460,
              background:"rgba(13,16,37,.97)", backdropFilter:"blur(20px)",
              border:"1px solid var(--gb2)", borderRadius:"var(--r3)",
              boxShadow:"var(--sh3)", display:"flex", flexDirection:"column",
              animation:"slideUp .2s ease", overflow:"hidden"
            }}>
              {/* Header */}
              <div style={{ background:"linear-gradient(135deg,var(--a),var(--a2))",
                padding:"var(--s3) var(--s4)", display:"flex", justifyContent:"space-between",
                alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"var(--s2)" }}>
                  <span style={{ fontSize:24 }}>🤖</span>
                  <div>
                    <div style={{ fontWeight:700, color:"#fff", fontSize:"var(--sm)" }}>Support Bot</div>
                    <div style={{ fontSize:"var(--xs)", color:"rgba(255,255,255,.7)" }}>
                      {typing ? "typing..." : "Online"}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:"var(--s1)" }}>
                  <button onClick={() => setMinimized(true)}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.7)", fontSize:16 }}>−</button>
                  <button onClick={() => setOpen(false)}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.7)", fontSize:16 }}>✕</button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex:1, overflowY:"auto", padding:"var(--s3)", display:"flex",
                flexDirection:"column", gap:"var(--s2)" }}>
                {messages.map(m => (
                  <div key={m.id} style={{ display:"flex", flexDirection:"column",
                    alignItems: m.from==="user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth:"80%", padding:"8px 12px", borderRadius:"var(--r2)",
                      fontSize:"var(--sm)", lineHeight:1.5,
                      background: m.from==="user"
                        ? "linear-gradient(135deg,var(--a),var(--a2))"
                        : "var(--glass2)",
                      color: m.from==="user" ? "#fff" : "var(--t1)",
                      border: m.from==="bot" ? "1px solid var(--gb)" : "none",
                      borderBottomRightRadius: m.from==="user" ? "var(--r1)" : undefined,
                      borderBottomLeftRadius:  m.from==="bot"  ? "var(--r1)" : undefined,
                    }}>
                      {m.text}
                    </div>
                    <span style={{ fontSize:"var(--xs)", color:"var(--t3)", marginTop:2 }}>{m.time}</span>
                  </div>
                ))}

                {typing && (
                  <div style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 12px",
                    background:"var(--glass2)", border:"1px solid var(--gb)", borderRadius:"var(--r2)",
                    width:"fit-content" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:6, height:6, borderRadius:"50%",
                        background:"var(--t3)", animation:`pulse 1s ease ${i*0.2}s infinite` }} />
                    ))}
                  </div>
                )}

                {/* Rating */}
                {showRating && !rated && (
                  <div style={{ display:"flex", gap:"var(--s1)", justifyContent:"center", padding:"var(--s2)" }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => rate(s)}
                        style={{ background:"none", border:"none", cursor:"pointer", fontSize:24 }}>
                        ⭐
                      </button>
                    ))}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div style={{ padding:"var(--s2) var(--s3)", display:"flex", flexWrap:"wrap", gap:"var(--s1)",
                  borderTop:"1px solid var(--gb)" }}>
                  {suggestions.map(s => (
                    <button key={s} onClick={() => send(s)}
                      style={{ background:"var(--abg)", border:"1px solid rgba(124,58,237,.3)",
                        borderRadius:"var(--pill)", padding:"4px 10px", fontSize:"var(--xs)",
                        color:"var(--a2)", cursor:"pointer", fontFamily:"var(--font)",
                        transition:"all var(--tr)" }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{ padding:"var(--s3)", borderTop:"1px solid var(--gb)",
                display:"flex", gap:"var(--s2)" }}>
                <input className="input" style={{ fontSize:"var(--sm)" }}
                  placeholder="Type a message..."
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && send(input)} />
                <button className="btn btn-primary btn-sm" onClick={() => send(input)}>➤</button>
              </div>
            </div>
          )}

          {/* Minimized bar */}
          {open && minimized && (
            <div style={{ position:"absolute", bottom:60, right:0, width:200,
              background:"linear-gradient(135deg,var(--a),var(--a2))",
              borderRadius:"var(--r2)", padding:"var(--s2) var(--s4)",
              display:"flex", justifyContent:"space-between", alignItems:"center",
              cursor:"pointer", boxShadow:"var(--sh2)" }}
              onClick={() => setMinimized(false)}>
              <span style={{ color:"#fff", fontSize:"var(--sm)", fontWeight:600 }}>Support Chat</span>
              <button onClick={e => { e.stopPropagation(); setOpen(false); }}
                style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.7)" }}>✕</button>
            </div>
          )}

          {/* Trigger button */}
          <button
            onClick={() => { setOpen(o => !o); setMinimized(false); }}
            style={{
              width:52, height:52, borderRadius:"50%",
              background:"linear-gradient(135deg,var(--a),var(--a2))",
              border:"none", cursor:"pointer", fontSize:24,
              boxShadow:"0 4px 20px var(--ags)", position:"relative",
              transition:"transform var(--tr)"
            }}
            onMouseEnter={e => e.currentTarget.style.transform="scale(1.1)"}
            onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
          >
            {open ? "✕" : "💬"}
            {unread > 0 && !open && (
              <span style={{ position:"absolute", top:-4, right:-4,
                background:"var(--err)", color:"#fff", borderRadius:"50%",
                width:18, height:18, fontSize:10, fontWeight:800,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {unread}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
