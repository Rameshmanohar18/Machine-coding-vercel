/**
 * PROBLEM 36 — UPI Payment Interface
 * Asked at: Paytm, PhonePe, Razorpay, Google Pay
 *
 * Requirements:
 * - Send money via UPI ID / phone / QR
 * - Recent contacts with quick pay
 * - Transaction PIN entry (masked)
 * - Payment success/failure animation
 * - Transaction history with status
 * - Split bill feature
 * - Request money flow
 * - Balance display with hide/show toggle
 */

import { useState, useRef, useCallback } from "react";

const CONTACTS = [
  { id:1, name:"Priya Sharma",  upi:"priya@paytm",   phone:"9876543210", avatar:"👩" },
  { id:2, name:"Rahul Gupta",   upi:"rahul@phonepe", phone:"9876543211", avatar:"👨" },
  { id:3, name:"Ananya Singh",  upi:"ananya@gpay",   phone:"9876543212", avatar:"👩‍💼" },
  { id:4, name:"Karthik Rajan", upi:"karthik@upi",   phone:"9876543213", avatar:"🧑" },
  { id:5, name:"Divya Nair",    upi:"divya@paytm",   phone:"9876543214", avatar:"👩‍🎨" },
];

const INITIAL_TXN = [
  { id:1, name:"Priya Sharma",  amount:500,  type:"sent",     status:"success", time:"10:30 AM", note:"Lunch" },
  { id:2, name:"Rahul Gupta",   amount:1200, type:"received", status:"success", time:"Yesterday", note:"Rent split" },
  { id:3, name:"Ananya Singh",  amount:250,  type:"sent",     status:"success", time:"Yesterday", note:"Coffee" },
  { id:4, name:"Karthik Rajan", amount:800,  type:"sent",     status:"failed",  time:"2 days ago", note:"Groceries" },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function UPIPayment() {
  const [tab,       setTab]       = useState("send"); // send | request | history | split
  const [step,      setStep]      = useState("home"); // home | amount | pin | result
  const [selected,  setSelected]  = useState(null);
  const [amount,    setAmount]    = useState("");
  const [note,      setNote]      = useState("");
  const [pin,       setPin]       = useState("");
  const [result,    setResult]    = useState(null); // success | failed
  const [balance,   setBalance]   = useState(24580);
  const [showBal,   setShowBal]   = useState(false);
  const [txns,      setTxns]      = useState(INITIAL_TXN);
  const [upiInput,  setUpiInput]  = useState("");
  const [splitAmt,  setSplitAmt]  = useState("");
  const [splitPeople,setSplitPeople]=useState([]);
  let txnId = useRef(10);

  const selectContact = (c) => { setSelected(c); setStep("amount"); };

  const proceedToPin = () => {
    if (!amount || Number(amount) <= 0) return;
    if (Number(amount) > balance) { alert("Insufficient balance"); return; }
    setStep("pin");
  };

  const submitPin = () => {
    if (pin.length < 4) return;
    // Simulate 90% success
    const success = Math.random() > 0.1;
    setTimeout(() => {
      setResult(success ? "success" : "failed");
      setStep("result");
      if (success) {
        setBalance(b => b - Number(amount));
        setTxns(t => [{
          id:txnId.current++, name:selected.name, amount:Number(amount),
          type:"sent", status:"success", time:"Just now", note
        }, ...t]);
      }
    }, 1500);
    setStep("processing");
  };

  const reset = () => {
    setStep("home"); setSelected(null); setAmount(""); setNote("");
    setPin(""); setResult(null); setUpiInput("");
  };

  const splitPerPerson = splitPeople.length > 0
    ? Math.ceil(Number(splitAmt) / (splitPeople.length + 1))
    : 0;

  return (
    <div className="card">
      <h2 className="card-title">📱 UPI Payment Interface</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Paytm, PhonePe, Razorpay.</strong> Send/request money, UPI PIN entry,
        transaction history, split bill, balance toggle, success/failure animation.
      </p>

      {/* Balance card */}
      <div style={{ background:"linear-gradient(135deg,rgba(124,58,237,.3),rgba(34,211,238,.2))",
        border:"1px solid rgba(124,58,237,.4)", borderRadius:"var(--r3)",
        padding:"var(--s5) var(--s6)", marginBottom:"var(--s5)",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:"var(--xs)", color:"rgba(255,255,255,.6)", fontWeight:600,
            textTransform:"uppercase", letterSpacing:".08em", marginBottom:"var(--s1)" }}>
            Available Balance
          </div>
          <div style={{ fontSize:"var(--2xl)", fontWeight:800, color:"#fff" }}>
            {showBal ? `₹${balance.toLocaleString()}` : "₹ ••••••"}
          </div>
        </div>
        <button onClick={() => setShowBal(s=>!s)}
          style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)",
            borderRadius:"var(--r2)", padding:"var(--s2) var(--s4)", color:"#fff",
            cursor:"pointer", fontSize:"var(--sm)", fontFamily:"var(--font)" }}>
          {showBal ? "🙈 Hide" : "👁 Show"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--gb)", marginBottom:"var(--s5)" }}>
        {[["send","💸 Send"],["request","📥 Request"],["split","✂️ Split"],["history","📋 History"]].map(([t,l]) => (
          <button key={t} onClick={() => { setTab(t); reset(); }}
            style={{ padding:"8px 14px", background:"none", border:"none", cursor:"pointer",
              fontFamily:"var(--font)", fontSize:"var(--sm)", fontWeight:tab===t?700:400,
              color:tab===t?"var(--a2)":"var(--t3)",
              borderBottom:tab===t?"2px solid var(--a2)":"2px solid transparent",
              marginBottom:-1, transition:"all var(--tr)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* SEND TAB */}
      {tab === "send" && (
        <div>
          {step === "home" && (
            <>
              {/* UPI ID input */}
              <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s5)" }}>
                <input className="input" placeholder="Enter UPI ID or phone number"
                  value={upiInput} onChange={e=>setUpiInput(e.target.value)} />
                <button className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (upiInput.trim()) selectContact({ name:upiInput, upi:upiInput, avatar:"👤" });
                  }}>Pay</button>
              </div>

              {/* Recent contacts */}
              <div className="label" style={{ marginBottom:"var(--s3)" }}>Recent</div>
              <div style={{ display:"flex", gap:"var(--s4)", overflowX:"auto", paddingBottom:"var(--s2)",
                marginBottom:"var(--s5)" }}>
                {CONTACTS.map(c => (
                  <div key={c.id} onClick={() => selectContact(c)}
                    style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"var(--s2)",
                      cursor:"pointer", minWidth:60 }}>
                    <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--abg)",
                      border:"1px solid var(--a)", display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:24, transition:"all var(--tr)" }}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--a)"}
                      onMouseLeave={e=>e.currentTarget.style.background="var(--abg)"}>
                      {c.avatar}
                    </div>
                    <span style={{ fontSize:"var(--xs)", color:"var(--t2)", textAlign:"center",
                      maxWidth:60, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {c.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick amounts */}
              <div className="label" style={{ marginBottom:"var(--s3)" }}>Quick Pay</div>
              <div style={{ display:"flex", gap:"var(--s2)", flexWrap:"wrap" }}>
                {QUICK_AMOUNTS.map(a => (
                  <button key={a} className="btn btn-ghost btn-sm"
                    onClick={() => { setAmount(String(a)); setStep("amount"); }}>
                    ₹{a}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "amount" && selected && (
            <div style={{ maxWidth:360 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"var(--s3)", marginBottom:"var(--s6)" }}>
                <span style={{ fontSize:40 }}>{selected.avatar}</span>
                <div>
                  <div style={{ fontWeight:700, color:"var(--t1)" }}>{selected.name}</div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{selected.upi}</div>
                </div>
              </div>

              <div style={{ textAlign:"center", marginBottom:"var(--s5)" }}>
                <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginBottom:"var(--s2)" }}>AMOUNT</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"var(--s2)" }}>
                  <span style={{ fontSize:"var(--xl)", color:"var(--t2)" }}>₹</span>
                  <input
                    style={{ fontSize:48, fontWeight:800, color:"var(--t1)", background:"transparent",
                      border:"none", outline:"none", width:200, textAlign:"center",
                      fontFamily:"var(--mono)" }}
                    type="number" placeholder="0" value={amount}
                    onChange={e=>setAmount(e.target.value)} autoFocus />
                </div>
                <div style={{ height:2, background:"var(--a)", margin:"0 auto", width:200, marginTop:"var(--s2)" }} />
              </div>

              <input className="input" placeholder="Add a note (optional)"
                value={note} onChange={e=>setNote(e.target.value)}
                style={{ marginBottom:"var(--s5)" }} />

              <div style={{ display:"flex", gap:"var(--s3)" }}>
                <button className="btn btn-ghost" onClick={reset}>← Back</button>
                <button className="btn btn-primary" style={{ flex:1 }} onClick={proceedToPin}
                  disabled={!amount || Number(amount)<=0}>
                  Proceed to Pay
                </button>
              </div>
            </div>
          )}

          {step === "pin" && (
            <div style={{ maxWidth:320, margin:"0 auto", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:"var(--s4)" }}>🔐</div>
              <h3 style={{ marginBottom:"var(--s2)" }}>Enter UPI PIN</h3>
              <p style={{ marginBottom:"var(--s5)", fontSize:"var(--sm)" }}>
                Paying ₹{Number(amount).toLocaleString()} to {selected?.name}
              </p>
              <div style={{ display:"flex", gap:"var(--s2)", justifyContent:"center", marginBottom:"var(--s5)" }}>
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} style={{ width:44, height:52, borderRadius:"var(--r2)",
                    background:"var(--glass2)", border:`1px solid ${i<pin.length?"var(--a)":"var(--gb)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:24, color:"var(--a2)" }}>
                    {i < pin.length ? "●" : ""}
                  </div>
                ))}
              </div>
              {/* Numpad */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"var(--s2)",
                maxWidth:240, margin:"0 auto var(--s5)" }}>
                {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i) => (
                  <button key={i} onClick={() => {
                    if (k==="⌫") setPin(p=>p.slice(0,-1));
                    else if (k!=="" && pin.length<6) setPin(p=>p+k);
                  }}
                    style={{ padding:"var(--s3)", borderRadius:"var(--r2)", border:"1px solid var(--gb)",
                      background:k===""?"transparent":"var(--glass2)", cursor:k===""?"default":"pointer",
                      fontFamily:"var(--font)", fontSize:"var(--lg)", fontWeight:700, color:"var(--t1)",
                      transition:"all var(--tr)" }}
                    disabled={k===""}>
                    {k}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width:"100%" }}
                onClick={submitPin} disabled={pin.length<4}>
                Pay ₹{Number(amount).toLocaleString()}
              </button>
            </div>
          )}

          {step === "processing" && (
            <div style={{ textAlign:"center", padding:"var(--s10)" }}>
              <div style={{ fontSize:56, marginBottom:"var(--s4)", animation:"pulse 1s ease infinite" }}>⏳</div>
              <h3>Processing payment...</h3>
            </div>
          )}

          {step === "result" && (
            <div style={{ textAlign:"center", padding:"var(--s8)" }}>
              <div style={{ fontSize:72, marginBottom:"var(--s4)" }}>
                {result==="success" ? "✅" : "❌"}
              </div>
              <h2 style={{ color:result==="success"?"var(--ok)":"var(--err)", marginBottom:"var(--s3)" }}>
                {result==="success" ? "Payment Successful!" : "Payment Failed"}
              </h2>
              {result==="success" && (
                <div style={{ fontSize:"var(--xl)", fontWeight:800, color:"var(--t1)", marginBottom:"var(--s2)" }}>
                  ₹{Number(amount).toLocaleString()}
                </div>
              )}
              <p style={{ marginBottom:"var(--s5)" }}>
                {result==="success"
                  ? `Paid to ${selected?.name}`
                  : "Please try again or use a different payment method"}
              </p>
              <button className="btn btn-primary" onClick={reset}>
                {result==="success" ? "Done" : "Try Again"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* REQUEST TAB */}
      {tab === "request" && (
        <div style={{ maxWidth:400 }}>
          <div className="label" style={{ marginBottom:"var(--s3)" }}>Request from</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)", marginBottom:"var(--s5)" }}>
            {CONTACTS.map(c => (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:"var(--s3)",
                padding:"var(--s3) var(--s4)", background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r2)" }}>
                <span style={{ fontSize:24 }}>{c.avatar}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:"var(--t1)", fontSize:"var(--sm)" }}>{c.name}</div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{c.upi}</div>
                </div>
                <button className="btn btn-primary btn-sm"
                  onClick={() => alert(`Request sent to ${c.name}`)}>
                  Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SPLIT TAB */}
      {tab === "split" && (
        <div style={{ maxWidth:400 }}>
          <div className="form-row">
            <label className="label">Total Bill Amount</label>
            <input className="input" type="number" placeholder="₹0"
              value={splitAmt} onChange={e=>setSplitAmt(e.target.value)} />
          </div>
          <div className="label" style={{ marginBottom:"var(--s3)" }}>Split with</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)", marginBottom:"var(--s5)" }}>
            {CONTACTS.map(c => (
              <label key={c.id} style={{ display:"flex", alignItems:"center", gap:"var(--s3)",
                padding:"var(--s3) var(--s4)", background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r2)", cursor:"pointer" }}>
                <input type="checkbox" checked={splitPeople.includes(c.id)}
                  onChange={() => setSplitPeople(p => p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id])}
                  style={{ accentColor:"var(--a2)" }} />
                <span style={{ fontSize:24 }}>{c.avatar}</span>
                <span style={{ flex:1, fontWeight:600, color:"var(--t1)", fontSize:"var(--sm)" }}>{c.name}</span>
                {splitPeople.includes(c.id) && splitAmt && (
                  <span style={{ color:"var(--ok)", fontWeight:700 }}>₹{splitPerPerson}</span>
                )}
              </label>
            ))}
          </div>
          {splitAmt && splitPeople.length > 0 && (
            <div style={{ background:"var(--ok-bg)", border:"1px solid rgba(16,185,129,.3)",
              borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s4)" }}>
              <div style={{ fontWeight:700, color:"var(--ok)", marginBottom:"var(--s2)" }}>Split Summary</div>
              <div style={{ fontSize:"var(--sm)", color:"var(--t1)" }}>
                ₹{splitAmt} ÷ {splitPeople.length+1} people = <strong>₹{splitPerPerson} each</strong>
              </div>
            </div>
          )}
          <button className="btn btn-primary" style={{ width:"100%" }}
            disabled={!splitAmt || splitPeople.length===0}
            onClick={() => alert(`Split request sent to ${splitPeople.length} people`)}>
            Send Split Requests
          </button>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)" }}>
          {txns.map(t => (
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:"var(--s3)",
              background:"var(--glass2)", border:"1px solid var(--gb)",
              borderLeft:`3px solid ${t.type==="received"?"var(--ok)":t.status==="failed"?"var(--err)":"var(--a2)"}`,
              borderRadius:"var(--r2)", padding:"10px 14px" }}>
              <span style={{ fontSize:24 }}>
                {t.type==="received"?"📥":t.status==="failed"?"❌":"📤"}
              </span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color:"var(--t1)", fontSize:"var(--sm)" }}>{t.name}</div>
                <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{t.note} · {t.time}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontWeight:800, fontSize:"var(--md)",
                  color:t.type==="received"?"var(--ok)":t.status==="failed"?"var(--err)":"var(--t1)" }}>
                  {t.type==="received"?"+":"-"}₹{t.amount.toLocaleString()}
                </div>
                <span className={`badge badge-${t.status==="success"?"ok":t.status==="failed"?"err":"warn"}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
