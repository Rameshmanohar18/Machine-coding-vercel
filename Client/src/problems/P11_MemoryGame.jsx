/**
 * PROBLEM 11 — Memory Card Game
 * ─────────────────────────────────────────────────────────────
 * Asked at: Google, Meta (UI/game logic round)
 *
 * Requirements:
 * - 4×4 grid of face-down cards (8 pairs)
 * - Flip two cards, check for match
 * - Matched cards stay face-up
 * - Mismatched cards flip back after 1s
 * - Track moves, matches, time elapsed
 * - Win detection with confetti
 * - Difficulty levels (4×4, 6×4)
 */

import { useState, useEffect, useCallback, useRef } from "react";

const EMOJIS = ["🎯","🎸","🎨","🎭","🎪","🎬","🎤","🎧","🎺","🎻","🥁","🎹"];

function createDeck(pairs) {
  const emojis = EMOJIS.slice(0, pairs);
  const deck   = [...emojis, ...emojis]
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5)
    .map((card, i) => ({ ...card, id: i }));
  return deck;
}

export default function MemoryGame() {
  const [pairs,    setPairs]    = useState(8);
  const [cards,    setCards]    = useState(() => createDeck(8));
  const [selected, setSelected] = useState([]);
  const [moves,    setMoves]    = useState(0);
  const [matches,  setMatches]  = useState(0);
  const [locked,   setLocked]   = useState(false);
  const [elapsed,  setElapsed]  = useState(0);
  const [started,  setStarted]  = useState(false);
  const [won,      setWon]      = useState(false);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (started && !won) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, won]);

  const reset = useCallback((p = pairs) => {
    clearInterval(timerRef.current);
    setCards(createDeck(p)); setSelected([]); setMoves(0);
    setMatches(0); setLocked(false); setElapsed(0);
    setStarted(false); setWon(false);
  }, [pairs]);

  const flip = (id) => {
    if (locked) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;

    if (!started) setStarted(true);

    const newSelected = [...selected, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);

      const [a, b] = newSelected.map(sid => cards.find(c => c.id === sid));
      const bCard  = cards.find(c => c.id === id);

      if (a.emoji === bCard.emoji) {
        // Match
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === a.id || c.id === id ? { ...c, matched: true } : c
          ));
          const newMatches = matches + 1;
          setMatches(newMatches);
          setSelected([]);
          setLocked(false);
          if (newMatches === pairs) { setWon(true); clearInterval(timerRef.current); }
        }, 400);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === a.id || c.id === id ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          setLocked(false);
        }, 1000);
      }
    } else {
      setSelected(newSelected);
    }
  };

  const cols = pairs === 12 ? 6 : 4;

  return (
    <div className="card">
      <h2 className="card-title">🃏 Memory Card Game</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at Google, Meta.</strong> Tests state management, timing, game logic.
        Flip two cards — find all pairs to win. Tracks moves and time.
      </p>

      {/* Controls */}
      <div style={{ display: "flex", gap: "var(--s3)", marginBottom: "var(--s5)", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "var(--s1)" }}>
          {[{p:8,label:"4×4"},{p:12,label:"6×4"}].map(({p,label}) => (
            <button key={p}
              className={`btn btn-sm ${pairs === p ? "btn-primary" : "btn-ghost"}`}
              onClick={() => { setPairs(p); reset(p); }}>
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => reset()}>↺ New Game</button>

        <div style={{ marginLeft: "auto", display: "flex", gap: "var(--s4)" }}>
          {[
            { label: "Moves",   value: moves,   color: "var(--a2)"  },
            { label: "Matches", value: `${matches}/${pairs}`, color: "var(--ok)" },
            { label: "Time",    value: `${elapsed}s`, color: "var(--warn)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "var(--xs)", color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
              <div style={{ fontSize: "var(--lg)", fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Win banner */}
      {won && (
        <div style={{
          background: "var(--ok-bg)", border: "1px solid rgba(16,185,129,.4)",
          borderRadius: "var(--r2)", padding: "var(--s4)", textAlign: "center",
          marginBottom: "var(--s5)", animation: "pulse 1s ease infinite"
        }}>
          <div style={{ fontSize: "var(--xl)", fontWeight: 800, color: "var(--ok)" }}>
            🎉 You won in {moves} moves and {elapsed}s!
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "var(--s3)"
      }}>
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => flip(card.id)}
            style={{
              aspectRatio: "1",
              borderRadius: "var(--r2)",
              cursor: card.matched || card.flipped ? "default" : "pointer",
              perspective: 600,
              position: "relative"
            }}
          >
            {/* Card face */}
            <div style={{
              width: "100%", height: "100%",
              borderRadius: "var(--r2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "clamp(20px, 4vw, 36px)",
              border: `1px solid ${card.matched ? "rgba(16,185,129,.4)" : card.flipped ? "var(--a)" : "var(--gb)"}`,
              background: card.matched
                ? "var(--ok-bg)"
                : card.flipped
                  ? "var(--abg)"
                  : "var(--glass2)",
              transition: "all .3s ease",
              transform: card.flipped || card.matched ? "rotateY(0deg)" : "rotateY(180deg)",
              boxShadow: card.matched ? "0 0 12px var(--ok-bg)" : card.flipped ? "0 0 12px var(--ags)" : "none"
            }}>
              {card.flipped || card.matched ? card.emoji : "❓"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
