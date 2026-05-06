/**
 * PROBLEM 22 — Payment Checkout Flow
 * Asked at: PayPal, Visa, Mastercard, Razorpay, Stripe
 *
 * Requirements:
 * - Multi-step: Cart → Address → Payment → Confirmation
 * - Cart with qty update / remove
 * - Address form with validation
 * - Payment: card / UPI / wallet selection
 * - Card number formatting (XXXX XXXX XXXX XXXX)
 * - CVV masking, expiry validation
 * - Order summary sidebar
 * - Success animation on confirm
 */

import { useState, useCallback } from "react";

const CART_ITEMS = [
  { id:1, name:"Nike Air Max",    price:4999, qty:1, img:"👟" },
  { id:2, name:"Levi's Jeans",    price:2499, qty:2, img:"👖" },
  { id:3, name:"Polo T-Shirt",    price:899,  qty:1, img:"👕" },
];

const STEPS = ["Cart", "Address", "Payment", "Confirm"];

function formatCard(val) {
  return val.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
}

function formatExpiry(val) {
  const v = val.replace(/\D/g,"").slice(0,4);
  return v.length > 2 ? v.slice(0,2)+"/"+v.slice(2) : v;
}

export default function PaymentCheckout() {
  const [step,    setStep]    = useState(0);
  const [cart,    setCart]    = useState(CART_ITEMS);
  const [address, setAddress] = useState({ name:"", phone:"", line1:"", city:"", pin:"", state:"" });
  const [payment, setPayment] = useState({ method:"card", card:"", expiry:"", cvv:"", upi:"" });
  const [errors,  setErrors]  = useState({});
  const [ordered, setOrdered] = useState(false);

  const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 5000 ? 0 : 99;
  const total    = subtotal + shipping;

  const updateQty = (id, delta) => {
    setCart(c => c.map(i => i.id===id ? { ...i, qty:Math.max(1, i.qty+delta) } : i));
  };
  const removeItem = (id) => setCart(c => c.filter(i => i.id!==id));

  const validateAddress = () => {
    const e = {};
    if (!address.name.trim())  e.name  = "Required";
    if (!/^\d{10}$/.test(address.phone)) e.phone = "10-digit number";
    if (!address.line1.trim()) e.line1 = "Required";
    if (!address.city.trim())  e.city  = "Required";
    if (!/^\d{6}$/.test(address.pin)) e.pin = "6-digit PIN";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validatePayment = () => {
    const e = {};
    if (payment.method === "card") {
      if (payment.card.replace(/\s/g,"").length < 16) e.card = "Enter 16-digit card number";
      if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) e.expiry = "MM/YY format";
      if (payment.cvv.length < 3) e.cvv = "3-digit CVV";
    }
    if (payment.method === "upi" && !payment.upi.includes("@")) e.upi = "Valid UPI ID required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (step === 1 && !validateAddress()) return;
    if (step === 2 && !validatePayment()) return;
    if (step === 3) { setOrdered(true); return; }
    setStep(s => s+1);
    setErrors({});
  };

  if (ordered) {
    return (
      <div className="card" style={{ textAlign:"center", padding:"var(--s10)" }}>
        <div style={{ fontSize:80, marginBottom:"var(--s4)", animation:"pulse 1s ease 3" }}>🎉</div>
        <h2 style={{ color:"var(--ok)", marginBottom:"var(--s3)" }}>Order Placed!</h2>
        <p style={{ marginBottom:"var(--s5)" }}>
          Order #ORD{Date.now().toString().slice(-6)} confirmed. Total: ₹{total.toLocaleString()}
        </p>
        <button className="btn btn-primary" onClick={() => { setOrdered(false); setStep(0); setCart(CART_ITEMS); }}>
          Place Another Order
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">💳 Payment Checkout</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at PayPal, Visa, Mastercard, Razorpay.</strong> Multi-step checkout:
        cart → address → payment → confirmation. Card formatting, validation, order summary.
      </p>

      {/* Step indicator */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:"var(--s6)" }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length-1 ? 1 : 0 }}>
            <div style={{
              width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center",
              justifyContent:"center", fontWeight:700, fontSize:"var(--sm)", flexShrink:0,
              background: i < step ? "var(--ok)" : i === step ? "var(--a)" : "var(--glass2)",
              color: i <= step ? "#fff" : "var(--t3)",
              border: `2px solid ${i < step ? "var(--ok)" : i === step ? "var(--a)" : "var(--gb)"}`,
            }}>
              {i < step ? "✓" : i+1}
            </div>
            <span style={{ fontSize:"var(--xs)", color: i===step?"var(--a2)":"var(--t3)",
              fontWeight: i===step?700:400, marginLeft:"var(--s2)", marginRight:"var(--s2)" }}>
              {s}
            </span>
            {i < STEPS.length-1 && (
              <div style={{ flex:1, height:1, background: i < step ? "var(--ok)" : "var(--gb)", marginRight:"var(--s2)" }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* Main content */}
        <div style={{ flex:1, minWidth:280 }}>

          {/* Step 0: Cart */}
          {step === 0 && (
            <div>
              <div className="label" style={{ marginBottom:"var(--s3)" }}>Your Cart ({cart.length} items)</div>
              {cart.map(item => (
                <div key={item.id} style={{ display:"flex", gap:"var(--s3)", alignItems:"center",
                  background:"var(--glass2)", border:"1px solid var(--gb)", borderRadius:"var(--r2)",
                  padding:"var(--s3) var(--s4)", marginBottom:"var(--s2)" }}>
                  <span style={{ fontSize:32 }}>{item.img}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, color:"var(--t1)", fontSize:"var(--sm)" }}>{item.name}</div>
                    <div style={{ color:"var(--ok)", fontWeight:700 }}>₹{item.price}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"var(--s2)" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => updateQty(item.id,-1)}>−</button>
                    <span style={{ fontWeight:700, minWidth:20, textAlign:"center" }}>{item.qty}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => updateQty(item.id,+1)}>+</button>
                  </div>
                  <span style={{ fontWeight:800, color:"var(--a2)", minWidth:60, textAlign:"right" }}>
                    ₹{(item.price*item.qty).toLocaleString()}
                  </span>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Address */}
          {step === 1 && (
            <div>
              <div className="label" style={{ marginBottom:"var(--s3)" }}>Delivery Address</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--s3)" }}>
                {[
                  { key:"name",  label:"Full Name",    span:2 },
                  { key:"phone", label:"Phone",        span:1 },
                  { key:"pin",   label:"PIN Code",     span:1 },
                  { key:"line1", label:"Address Line", span:2 },
                  { key:"city",  label:"City",         span:1 },
                  { key:"state", label:"State",        span:1 },
                ].map(f => (
                  <div key={f.key} style={{ gridColumn:`span ${f.span}` }}>
                    <label className="label">{f.label}</label>
                    <input className="input" value={address[f.key]}
                      style={{ borderColor: errors[f.key] ? "var(--err)" : undefined }}
                      onChange={e => setAddress(a => ({ ...a, [f.key]:e.target.value }))} />
                    {errors[f.key] && <span style={{ color:"var(--err)", fontSize:"var(--xs)" }}>{errors[f.key]}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div>
              <div className="label" style={{ marginBottom:"var(--s3)" }}>Payment Method</div>
              <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s5)" }}>
                {[
                  { val:"card",   label:"💳 Card"   },
                  { val:"upi",    label:"📱 UPI"    },
                  { val:"wallet", label:"👛 Wallet" },
                ].map(m => (
                  <button key={m.val}
                    className={`btn btn-sm ${payment.method===m.val?"btn-primary":"btn-ghost"}`}
                    onClick={() => setPayment(p => ({ ...p, method:m.val }))}>
                    {m.label}
                  </button>
                ))}
              </div>

              {payment.method === "card" && (
                <div style={{ display:"flex", flexDirection:"column", gap:"var(--s3)" }}>
                  <div>
                    <label className="label">Card Number</label>
                    <input className="input" placeholder="1234 5678 9012 3456"
                      value={payment.card}
                      onChange={e => setPayment(p => ({ ...p, card:formatCard(e.target.value) }))}
                      style={{ fontFamily:"var(--mono)", letterSpacing:2, borderColor:errors.card?"var(--err)":undefined }} />
                    {errors.card && <span style={{ color:"var(--err)", fontSize:"var(--xs)" }}>{errors.card}</span>}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--s3)" }}>
                    <div>
                      <label className="label">Expiry</label>
                      <input className="input" placeholder="MM/YY"
                        value={payment.expiry}
                        onChange={e => setPayment(p => ({ ...p, expiry:formatExpiry(e.target.value) }))}
                        style={{ borderColor:errors.expiry?"var(--err)":undefined }} />
                      {errors.expiry && <span style={{ color:"var(--err)", fontSize:"var(--xs)" }}>{errors.expiry}</span>}
                    </div>
                    <div>
                      <label className="label">CVV</label>
                      <input className="input" type="password" placeholder="•••" maxLength={3}
                        value={payment.cvv}
                        onChange={e => setPayment(p => ({ ...p, cvv:e.target.value.replace(/\D/g,"") }))}
                        style={{ borderColor:errors.cvv?"var(--err)":undefined }} />
                      {errors.cvv && <span style={{ color:"var(--err)", fontSize:"var(--xs)" }}>{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              )}

              {payment.method === "upi" && (
                <div>
                  <label className="label">UPI ID</label>
                  <input className="input" placeholder="yourname@upi"
                    value={payment.upi}
                    onChange={e => setPayment(p => ({ ...p, upi:e.target.value }))}
                    style={{ borderColor:errors.upi?"var(--err)":undefined }} />
                  {errors.upi && <span style={{ color:"var(--err)", fontSize:"var(--xs)" }}>{errors.upi}</span>}
                </div>
              )}

              {payment.method === "wallet" && (
                <div style={{ display:"flex", gap:"var(--s3)", flexWrap:"wrap" }}>
                  {["Paytm","PhonePe","Amazon Pay","Google Pay"].map(w => (
                    <button key={w} className="btn btn-ghost" style={{ flex:1 }}>{w}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <div className="label" style={{ marginBottom:"var(--s3)" }}>Order Summary</div>
              {cart.map(i => (
                <div key={i.id} style={{ display:"flex", justifyContent:"space-between",
                  padding:"var(--s2) 0", borderBottom:"1px solid var(--gb)", fontSize:"var(--sm)" }}>
                  <span style={{ color:"var(--t1)" }}>{i.img} {i.name} × {i.qty}</span>
                  <span style={{ color:"var(--ok)", fontWeight:700 }}>₹{(i.price*i.qty).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ marginTop:"var(--s4)", padding:"var(--s3)", background:"var(--glass2)",
                borderRadius:"var(--r2)", fontSize:"var(--sm)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s1)" }}>
                  <span style={{ color:"var(--t2)" }}>Delivering to</span>
                  <span style={{ color:"var(--t1)" }}>{address.name}, {address.city}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:"var(--t2)" }}>Payment</span>
                  <span style={{ color:"var(--t1)", textTransform:"capitalize" }}>{payment.method}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:"flex", gap:"var(--s3)", marginTop:"var(--s6)" }}>
            {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(s => s-1)}>← Back</button>}
            <button className="btn btn-primary" style={{ flex:1 }} onClick={next}
              disabled={step===0 && cart.length===0}>
              {step === 3 ? "🎉 Place Order" : step === 2 ? "Review Order →" : "Continue →"}
            </button>
          </div>
        </div>

        {/* Order summary sidebar */}
        <div style={{ minWidth:200, flex:"0 0 200px" }}>
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)", position:"sticky", top:0 }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>Price Details</div>
            {[
              { label:`Subtotal (${cart.reduce((s,i)=>s+i.qty,0)} items)`, val:`₹${subtotal.toLocaleString()}` },
              { label:"Shipping",  val: shipping===0 ? "FREE" : `₹${shipping}`, color: shipping===0?"var(--ok)":undefined },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between",
                fontSize:"var(--sm)", marginBottom:"var(--s2)" }}>
                <span style={{ color:"var(--t2)" }}>{r.label}</span>
                <span style={{ color:r.color||"var(--t1)", fontWeight:600 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ borderTop:"1px solid var(--gb)", paddingTop:"var(--s3)", marginTop:"var(--s2)",
              display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontWeight:700, color:"var(--t1)" }}>Total</span>
              <span style={{ fontWeight:800, color:"var(--ok)", fontSize:"var(--lg)" }}>₹{total.toLocaleString()}</span>
            </div>
            {shipping === 0 && (
              <div style={{ marginTop:"var(--s2)", fontSize:"var(--xs)", color:"var(--ok)" }}>
                🎉 Free shipping applied!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
