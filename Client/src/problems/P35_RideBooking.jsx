/**
 * PROBLEM 35 — Ride Booking App
 * Asked at: Uber, Gojek, Ola
 *
 * Requirements:
 * - Pickup & drop location input with autocomplete
 * - Ride type selector (UberGo, Premier, Auto, Bike)
 * - Fare estimate with surge pricing indicator
 * - Driver matching simulation (searching → found → ETA)
 * - Live driver location on SVG map
 * - Trip status timeline
 * - Cancel ride with reason
 * - Rating after trip
 */

import { useState, useEffect, useRef, useCallback } from "react";

const RIDE_TYPES = [
  { id:"bike",    name:"Bike",     icon:"🏍",  base:25,  perKm:6,  capacity:1, eta:3  },
  { id:"auto",    name:"Auto",     icon:"🛺",  base:40,  perKm:10, capacity:3, eta:5  },
  { id:"go",      name:"UberGo",   icon:"🚗",  base:60,  perKm:14, capacity:4, eta:7  },
  { id:"premier", name:"Premier",  icon:"🚙",  base:100, perKm:20, capacity:4, eta:10 },
  { id:"xl",      name:"UberXL",   icon:"🚐",  base:120, perKm:22, capacity:6, eta:12 },
];

const LOCATIONS = [
  "Koramangala, Bangalore","Indiranagar, Bangalore","MG Road, Bangalore",
  "Whitefield, Bangalore","Electronic City, Bangalore","HSR Layout, Bangalore",
  "Jayanagar, Bangalore","BTM Layout, Bangalore","Marathahalli, Bangalore",
];

const CANCEL_REASONS = [
  "Driver is too far","Changed my plans","Found another ride","Wrong vehicle type","Price too high"
];

const TRIP_STATES = ["idle","searching","found","arriving","in_trip","completed","cancelled"];

const DRIVERS = [
  { name:"Ravi Kumar",   rating:4.8, trips:1240, vehicle:"KA 01 AB 1234", photo:"👨‍✈️" },
  { name:"Suresh Babu",  rating:4.6, trips:890,  vehicle:"KA 02 CD 5678", photo:"🧑‍✈️" },
  { name:"Priya Devi",   rating:4.9, trips:2100, vehicle:"KA 03 EF 9012", photo:"👩‍✈️" },
];

function SVGMap({ driverPos, pickup, drop, tripState }) {
  return (
    <svg width="100%" height={200} style={{ background:"var(--glass)", borderRadius:"var(--r2)",
      border:"1px solid var(--gb)" }}>
      {/* Road grid */}
      {[40,80,120,160].map(y => (
        <line key={`h${y}`} x1={0} y1={y} x2={400} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      ))}
      {[80,160,240,320].map(x => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={200} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      ))}

      {/* Route line */}
      {tripState !== "idle" && (
        <line x1={80} y1={150} x2={300} y2={60}
          stroke="var(--a2)" strokeWidth={2} strokeDasharray="6,4" opacity={0.6} />
      )}

      {/* Pickup */}
      <circle cx={80} cy={150} r={8} fill="var(--ok)" />
      <text x={90} y={155} style={{ fontSize:10, fill:"var(--ok)", fontFamily:"var(--font)" }}>Pickup</text>

      {/* Drop */}
      <circle cx={300} cy={60} r={8} fill="var(--err)" />
      <text x={310} y={65} style={{ fontSize:10, fill:"var(--err)", fontFamily:"var(--font)" }}>Drop</text>

      {/* Driver */}
      {tripState !== "idle" && tripState !== "cancelled" && (
        <g transform={`translate(${driverPos.x},${driverPos.y})`}>
          <circle r={14} fill="var(--a)" opacity={0.9} />
          <text textAnchor="middle" dominantBaseline="middle" style={{ fontSize:14 }}>🚗</text>
        </g>
      )}
    </svg>
  );
}

export default function RideBooking() {
  const [pickup,    setPickup]    = useState("");
  const [drop,      setDrop]      = useState("");
  const [rideType,  setRideType]  = useState("go");
  const [tripState, setTripState] = useState("idle");
  const [driver,    setDriver]    = useState(null);
  const [eta,       setEta]       = useState(0);
  const [surge,     setSurge]     = useState(1.0);
  const [driverPos, setDriverPos] = useState({ x:200, y:100 });
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel,   setShowCancel]   = useState(false);
  const [rating,    setRating]    = useState(0);
  const [distance,  setDistance]  = useState(5.2);
  const timerRef = useRef(null);

  const ride = RIDE_TYPES.find(r => r.id === rideType);
  const fare = Math.round((ride.base + ride.perKm * distance) * surge);

  const bookRide = () => {
    if (!pickup || !drop) return;
    setSurge(Math.random() > 0.7 ? 1.5 : 1.0);
    setTripState("searching");

    timerRef.current = setTimeout(() => {
      setDriver(DRIVERS[Math.floor(Math.random()*DRIVERS.length)]);
      setEta(ride.eta);
      setTripState("found");

      // Simulate driver arriving
      let t = ride.eta;
      const countdown = setInterval(() => {
        t--;
        setEta(t);
        setDriverPos(p => ({ x:p.x + (80-p.x)*0.15, y:p.y + (150-p.y)*0.15 }));
        if (t <= 0) {
          clearInterval(countdown);
          setTripState("arriving");
          setTimeout(() => {
            setTripState("in_trip");
            // Simulate trip
            let progress = 0;
            const trip = setInterval(() => {
              progress++;
              setDriverPos(p => ({ x:p.x + (300-p.x)*0.08, y:p.y + (60-p.y)*0.08 }));
              if (progress >= 12) {
                clearInterval(trip);
                setTripState("completed");
              }
            }, 800);
          }, 2000);
        }
      }, 1000);
    }, 2500);
  };

  const cancelRide = () => {
    clearTimeout(timerRef.current);
    setTripState("cancelled");
    setShowCancel(false);
    setDriverPos({ x:200, y:100 });
  };

  const reset = () => {
    setTripState("idle"); setDriver(null); setEta(0);
    setRating(0); setDriverPos({ x:200, y:100 }); setPickup(""); setDrop("");
  };

  const STATUS_LABELS = {
    idle:"Ready to book", searching:"Finding your driver...",
    found:`Driver found! Arriving in ${eta} min`, arriving:"Driver has arrived!",
    in_trip:"On your way 🚗", completed:"Trip completed!", cancelled:"Ride cancelled"
  };

  return (
    <div className="card">
      <h2 className="card-title">🚗 Ride Booking App</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Uber, Gojek, Ola.</strong> Ride type selector, fare estimate with surge,
        driver matching simulation, live SVG map, trip timeline, cancel + rating.
      </p>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* Left: booking form */}
        <div style={{ flex:1, minWidth:260 }}>
          {tripState === "idle" && (
            <>
              {/* Location inputs */}
              <div className="form-row">
                <label className="label">📍 Pickup</label>
                <select className="select" value={pickup} onChange={e=>setPickup(e.target.value)}>
                  <option value="">Select pickup location</option>
                  {LOCATIONS.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="label">🎯 Drop</label>
                <select className="select" value={drop} onChange={e=>setDrop(e.target.value)}>
                  <option value="">Select drop location</option>
                  {LOCATIONS.filter(l=>l!==pickup).map(l=><option key={l}>{l}</option>)}
                </select>
              </div>

              {/* Distance slider */}
              <div className="form-row">
                <label className="label">Distance: <span style={{color:"var(--a2)"}}>{distance} km</span></label>
                <input type="range" min={1} max={30} step={0.5} value={distance}
                  onChange={e=>setDistance(Number(e.target.value))}
                  style={{ width:"100%", accentColor:"var(--a)" }} />
              </div>

              {/* Ride types */}
              <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)", marginBottom:"var(--s5)" }}>
                {RIDE_TYPES.map(r => (
                  <div key={r.id}
                    onClick={() => setRideType(r.id)}
                    style={{
                      display:"flex", alignItems:"center", gap:"var(--s3)",
                      padding:"var(--s3) var(--s4)", borderRadius:"var(--r2)", cursor:"pointer",
                      background:rideType===r.id?"var(--abg)":"var(--glass2)",
                      border:`1px solid ${rideType===r.id?"var(--a)":"var(--gb)"}`,
                      transition:"all var(--tr)"
                    }}>
                    <span style={{ fontSize:24 }}>{r.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{r.name}</div>
                      <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
                        {r.capacity} seats · {r.eta} min away
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, color:"var(--ok)", fontSize:"var(--md)" }}>
                        ₹{Math.round((r.base + r.perKm * distance))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" style={{ width:"100%" }}
                onClick={bookRide} disabled={!pickup || !drop}>
                Book {ride.name} — ₹{fare}
              </button>
            </>
          )}

          {/* Searching */}
          {tripState === "searching" && (
            <div style={{ textAlign:"center", padding:"var(--s8)" }}>
              <div style={{ fontSize:48, marginBottom:"var(--s4)", animation:"pulse 1s ease infinite" }}>🔍</div>
              <h3 style={{ marginBottom:"var(--s3)" }}>Finding your driver...</h3>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"var(--s2)",
                color:"var(--t2)" }}>
                <span className="spinner" /> Searching nearby drivers
              </div>
              <button className="btn btn-danger btn-sm" style={{ marginTop:"var(--s5)" }}
                onClick={() => { setTripState("cancelled"); }}>Cancel</button>
            </div>
          )}

          {/* Driver found / in trip */}
          {["found","arriving","in_trip"].includes(tripState) && driver && (
            <div>
              <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r3)", padding:"var(--s5)", marginBottom:"var(--s4)" }}>
                <div style={{ display:"flex", gap:"var(--s4)", alignItems:"center", marginBottom:"var(--s4)" }}>
                  <span style={{ fontSize:48 }}>{driver.photo}</span>
                  <div>
                    <div style={{ fontWeight:800, color:"var(--t1)", fontSize:"var(--lg)" }}>{driver.name}</div>
                    <div style={{ color:"#f59e0b", fontWeight:700 }}>★ {driver.rating}</div>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{driver.trips} trips · {driver.vehicle}</div>
                  </div>
                </div>

                <div style={{ background:"var(--glass)", borderRadius:"var(--r2)", padding:"var(--s3)",
                  textAlign:"center", marginBottom:"var(--s3)" }}>
                  <div style={{ fontSize:"var(--xl)", fontWeight:800,
                    color:tripState==="arriving"?"var(--ok)":tripState==="in_trip"?"var(--a2)":"var(--warn)" }}>
                    {tripState==="found" ? `${eta} min` : tripState==="arriving" ? "Arrived!" : "In Trip"}
                  </div>
                  <div style={{ fontSize:"var(--sm)", color:"var(--t2)" }}>{STATUS_LABELS[tripState]}</div>
                </div>

                {tripState !== "in_trip" && (
                  <button className="btn btn-danger btn-sm" style={{ width:"100%" }}
                    onClick={() => setShowCancel(true)}>
                    Cancel Ride
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Completed */}
          {tripState === "completed" && (
            <div style={{ textAlign:"center", padding:"var(--s6)" }}>
              <div style={{ fontSize:56, marginBottom:"var(--s3)" }}>🎉</div>
              <h3 style={{ color:"var(--ok)", marginBottom:"var(--s2)" }}>Trip Completed!</h3>
              <div style={{ fontSize:"var(--xl)", fontWeight:800, color:"var(--t1)", marginBottom:"var(--s4)" }}>
                ₹{fare} {surge > 1 && <span style={{ fontSize:"var(--sm)", color:"var(--warn)" }}>({surge}x surge)</span>}
              </div>
              <div style={{ marginBottom:"var(--s5)" }}>
                <div style={{ fontSize:"var(--sm)", color:"var(--t2)", marginBottom:"var(--s2)" }}>Rate your trip</div>
                <div style={{ display:"flex", justifyContent:"center", gap:"var(--s2)" }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRating(s)}
                      style={{ background:"none", border:"none", cursor:"pointer",
                        fontSize:32, color:s<=rating?"#f59e0b":"var(--t3)", transition:"color var(--tr)" }}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" onClick={reset}>Book Another Ride</button>
            </div>
          )}

          {/* Cancelled */}
          {tripState === "cancelled" && (
            <div style={{ textAlign:"center", padding:"var(--s6)" }}>
              <div style={{ fontSize:48, marginBottom:"var(--s3)" }}>❌</div>
              <h3 style={{ color:"var(--err)", marginBottom:"var(--s3)" }}>Ride Cancelled</h3>
              <button className="btn btn-primary" onClick={reset}>Try Again</button>
            </div>
          )}
        </div>

        {/* Right: map + status */}
        <div style={{ flex:1, minWidth:260 }}>
          <SVGMap driverPos={driverPos} tripState={tripState} />

          {/* Trip timeline */}
          <div style={{ marginTop:"var(--s4)" }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>Trip Status</div>
            {[
              { state:"searching", label:"Finding driver",   icon:"🔍" },
              { state:"found",     label:"Driver assigned",  icon:"✅" },
              { state:"arriving",  label:"Driver arrived",   icon:"📍" },
              { state:"in_trip",   label:"On the way",       icon:"🚗" },
              { state:"completed", label:"Trip completed",   icon:"🎉" },
            ].map((s, i) => {
              const idx = TRIP_STATES.indexOf(tripState);
              const sIdx = TRIP_STATES.indexOf(s.state);
              const done = idx > sIdx;
              const active = idx === sIdx;
              return (
                <div key={s.state} style={{ display:"flex", gap:"var(--s3)", alignItems:"center",
                  marginBottom:"var(--s2)", opacity:done||active?1:0.3 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", display:"flex",
                    alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0,
                    background:done?"var(--ok-bg)":active?"var(--abg)":"var(--glass)",
                    border:`1px solid ${done?"var(--ok)":active?"var(--a)":"var(--gb)"}` }}>
                    {done?"✓":s.icon}
                  </div>
                  <span style={{ fontSize:"var(--sm)", color:active?"var(--a2)":done?"var(--ok)":"var(--t2)",
                    fontWeight:active||done?700:400 }}>
                    {s.label}
                  </span>
                  {active && <span className="spinner" style={{ width:12, height:12, borderWidth:1.5 }} />}
                </div>
              );
            })}
          </div>

          {/* Fare breakdown */}
          {tripState !== "idle" && (
            <div style={{ marginTop:"var(--s4)", background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)" }}>
              <div className="label" style={{ marginBottom:"var(--s3)" }}>Fare Breakdown</div>
              {[
                { label:"Base fare",    val:`₹${ride.base}` },
                { label:`Distance (${distance}km)`, val:`₹${Math.round(ride.perKm*distance)}` },
                ...(surge>1?[{ label:`Surge (${surge}x)`, val:`+${Math.round(fare*(1-1/surge))}`, color:"var(--warn)" }]:[]),
              ].map(r => (
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between",
                  fontSize:"var(--sm)", padding:"var(--s1) 0", borderBottom:"1px solid var(--gb)" }}>
                  <span style={{ color:"var(--t2)" }}>{r.label}</span>
                  <span style={{ color:r.color||"var(--t1)", fontWeight:600 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"var(--s2)",
                fontWeight:800, fontSize:"var(--lg)" }}>
                <span style={{ color:"var(--t1)" }}>Total</span>
                <span style={{ color:"var(--ok)" }}>₹{fare}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel modal */}
      {showCancel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(7,9,26,.8)", backdropFilter:"blur(8px)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}
          onClick={() => setShowCancel(false)}>
          <div style={{ background:"rgba(13,16,37,.97)", border:"1px solid var(--gb2)",
            borderRadius:"var(--r4)", padding:"var(--s8)", width:360, animation:"slideUp .2s ease" }}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{ marginBottom:"var(--s4)" }}>Cancel Ride?</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)", marginBottom:"var(--s5)" }}>
              {CANCEL_REASONS.map(r => (
                <label key={r} style={{ display:"flex", alignItems:"center", gap:"var(--s3)",
                  padding:"var(--s3)", borderRadius:"var(--r2)", cursor:"pointer",
                  background:cancelReason===r?"var(--err-bg)":"var(--glass2)",
                  border:`1px solid ${cancelReason===r?"var(--err)":"var(--gb)"}` }}>
                  <input type="radio" name="cancel" checked={cancelReason===r}
                    onChange={() => setCancelReason(r)} style={{ accentColor:"var(--err)" }} />
                  <span style={{ fontSize:"var(--sm)", color:"var(--t1)" }}>{r}</span>
                </label>
              ))}
            </div>
            <div style={{ display:"flex", gap:"var(--s3)" }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowCancel(false)}>Keep Ride</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={cancelRide}
                disabled={!cancelReason}>Cancel Ride</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
