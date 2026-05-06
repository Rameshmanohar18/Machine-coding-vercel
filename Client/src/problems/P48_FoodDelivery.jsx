/**
 * PROBLEM 48 — Food Delivery App (Swiggy/Zomato clone)
 * Asked at: Swiggy, Zomato, Gojek Food
 */

import { useState, useMemo } from "react";

const RESTAURANTS = [
  { id:1, name:"Burger King",      cuisine:"American",  rating:4.2, time:"25-30 min", cost:200, offer:"20% off",  img:"🍔" },
  { id:2, name:"Pizza Hut",        cuisine:"Italian",   rating:4.0, time:"30-40 min", cost:300, offer:"Free drink",img:"🍕" },
  { id:3, name:"Biryani Blues",    cuisine:"Indian",    rating:4.5, time:"35-45 min", cost:250, offer:"",          img:"🍛" },
  { id:4, name:"Subway",           cuisine:"American",  rating:3.9, time:"20-25 min", cost:150, offer:"Buy 1 Get 1",img:"🥪"},
  { id:5, name:"Domino's",         cuisine:"Italian",   rating:4.1, time:"25-35 min", cost:280, offer:"30% off",  img:"🍕" },
  { id:6, name:"KFC",              cuisine:"American",  rating:4.3, time:"20-30 min", cost:220, offer:"",          img:"🍗" },
  { id:7, name:"Haldiram's",       cuisine:"Indian",    rating:4.4, time:"30-40 min", cost:180, offer:"15% off",  img:"🥘" },
  { id:8, name:"Sushi Garden",     cuisine:"Japanese",  rating:4.6, time:"40-50 min", cost:500, offer:"",          img:"🍱" },
];

const MENUS = {
  1: [
    { id:101, name:"Whopper",        price:199, desc:"Flame-grilled beef patty",  img:"🍔", veg:false },
    { id:102, name:"Chicken Royale", price:179, desc:"Crispy chicken sandwich",   img:"🍗", veg:false },
    { id:103, name:"Veggie Burger",  price:149, desc:"Garden fresh veggie patty", img:"🥗", veg:true  },
    { id:104, name:"Fries",          price:89,  desc:"Crispy golden fries",       img:"🍟", veg:true  },
  ],
  2: [
    { id:201, name:"Margherita",     price:299, desc:"Classic tomato & cheese",   img:"🍕", veg:true  },
    { id:202, name:"Pepperoni",      price:349, desc:"Loaded with pepperoni",     img:"🍕", veg:false },
    { id:203, name:"BBQ Chicken",    price:379, desc:"Smoky BBQ chicken",         img:"🍕", veg:false },
    { id:204, name:"Garlic Bread",   price:99,  desc:"Toasted with garlic butter",img:"🥖", veg:true  },
  ],
};

const DEFAULT_MENU = [
  { id:901, name:"Special Dish",    price:199, desc:"Chef's special",             img:"🍽", veg:true  },
  { id:902, name:"Combo Meal",      price:299, desc:"Complete meal combo",        img:"🥡", veg:false },
];

export default function FoodDelivery() {
  const [search,    setSearch]    = useState("");
  const [cuisine,   setCuisine]   = useState("All");
  const [sortBy,    setSortBy]    = useState("rating");
  const [vegOnly,   setVegOnly]   = useState(false);
  const [cart,      setCart]      = useState({});
  const [selected,  setSelected]  = useState(null);
  const [step,      setStep]      = useState("browse"); // browse | menu | checkout | tracking
  const [address,   setAddress]   = useState("");
  const [ordered,   setOrdered]   = useState(false);
  const [trackStep, setTrackStep] = useState(0);

  const cuisines = ["All", ...new Set(RESTAURANTS.map(r=>r.cuisine))];

  const filtered = useMemo(() => {
    let list = RESTAURANTS.filter(r => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (cuisine !== "All" && r.cuisine !== cuisine) return false;
      return true;
    });
    if (sortBy==="rating") list = [...list].sort((a,b)=>b.rating-a.rating);
    if (sortBy==="time")   list = [...list].sort((a,b)=>parseInt(a.time)-parseInt(b.time));
    if (sortBy==="cost")   list = [...list].sort((a,b)=>a.cost-b.cost);
    return list;
  }, [search, cuisine, sortBy]);

  const menu = MENUS[selected?.id] || DEFAULT_MENU;
  const filteredMenu = vegOnly ? menu.filter(i=>i.veg) : menu;

  const addToCart = (item) => setCart(c => ({ ...c, [item.id]:{ ...item, qty:(c[item.id]?.qty||0)+1 } }));
  const removeFromCart = (id) => setCart(c => {
    const qty = (c[id]?.qty||0) - 1;
    if (qty <= 0) { const n={...c}; delete n[id]; return n; }
    return { ...c, [id]:{ ...c[id], qty } };
  });

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s,i)=>s+i.price*i.qty,0);
  const cartCount = cartItems.reduce((s,i)=>s+i.qty,0);

  const placeOrder = () => {
    if (!address.trim()) return;
    setOrdered(true); setStep("tracking"); setTrackStep(0);
    const steps = [0,1,2,3,4];
    steps.forEach((s,i) => setTimeout(() => setTrackStep(s), i*3000));
  };

  const TRACK_STEPS = [
    { label:"Order Placed",      icon:"✅" },
    { label:"Restaurant Accepted",icon:"👨‍🍳" },
    { label:"Food Being Prepared",icon:"🍳" },
    { label:"Out for Delivery",  icon:"🛵" },
    { label:"Delivered!",        icon:"🎉" },
  ];

  if (step === "tracking") {
    return (
      <div className="card">
        <h2 className="card-title">🛵 Order Tracking</h2>
        <div style={{ textAlign:"center", marginBottom:"var(--s6)" }}>
          <div style={{ fontSize:64, marginBottom:"var(--s3)" }}>
            {TRACK_STEPS[trackStep]?.icon}
          </div>
          <h3 style={{ color:"var(--ok)" }}>{TRACK_STEPS[trackStep]?.label}</h3>
          {trackStep < 4 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
              gap:"var(--s2)", color:"var(--t2)", marginTop:"var(--s2)" }}>
              <span className="spinner" /> Updating...
            </div>
          )}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"var(--s3)", marginBottom:"var(--s6)" }}>
          {TRACK_STEPS.map((s,i) => (
            <div key={i} style={{ display:"flex", gap:"var(--s3)", alignItems:"center" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", display:"flex",
                alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0,
                background:i<=trackStep?"var(--ok-bg)":"var(--glass2)",
                border:`1px solid ${i<=trackStep?"var(--ok)":"var(--gb)"}` }}>
                {i<=trackStep?"✓":s.icon}
              </div>
              <span style={{ color:i<=trackStep?"var(--ok)":i===trackStep+1?"var(--t1)":"var(--t3)",
                fontWeight:i===trackStep?700:400, fontSize:"var(--sm)" }}>
                {s.label}
              </span>
              {i===trackStep && <span className="spinner" style={{ width:12,height:12,borderWidth:1.5 }} />}
            </div>
          ))}
        </div>

        {trackStep >= 4 && (
          <button className="btn btn-primary" style={{ width:"100%" }}
            onClick={() => { setStep("browse"); setCart({}); setOrdered(false); setTrackStep(0); }}>
            Order Again
          </button>
        )}
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className="card">
        <button className="btn btn-ghost btn-sm" style={{ marginBottom:"var(--s4)" }}
          onClick={() => setStep("menu")}>← Back</button>
        <h2 className="card-title">🛒 Checkout</h2>

        <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:260 }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>Order Summary</div>
            {cartItems.map(item => (
              <div key={item.id} style={{ display:"flex", justifyContent:"space-between",
                padding:"var(--s2) 0", borderBottom:"1px solid var(--gb)", fontSize:"var(--sm)" }}>
                <span style={{ color:"var(--t1)" }}>{item.img} {item.name} × {item.qty}</span>
                <span style={{ color:"var(--ok)", fontWeight:700 }}>₹{item.price*item.qty}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"var(--s3) 0",
              fontWeight:800, fontSize:"var(--lg)" }}>
              <span>Total</span>
              <span style={{ color:"var(--ok)" }}>₹{cartTotal + 40}</span>
            </div>
            <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
              Subtotal ₹{cartTotal} + Delivery ₹40
            </div>
          </div>

          <div style={{ flex:1, minWidth:260 }}>
            <div className="form-row">
              <label className="label">Delivery Address</label>
              <textarea className="textarea" style={{ minHeight:80 }}
                placeholder="Enter your full address..."
                value={address} onChange={e=>setAddress(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width:"100%" }}
              onClick={placeOrder} disabled={!address.trim()}>
              Place Order — ₹{cartTotal+40}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "menu" && selected) {
    return (
      <div className="card">
        <button className="btn btn-ghost btn-sm" style={{ marginBottom:"var(--s4)" }}
          onClick={() => setStep("browse")}>← Back</button>

        <div style={{ display:"flex", gap:"var(--s4)", alignItems:"center", marginBottom:"var(--s5)" }}>
          <span style={{ fontSize:48 }}>{selected.img}</span>
          <div>
            <h2 style={{ marginBottom:"var(--s1)" }}>{selected.name}</h2>
            <div style={{ color:"var(--t2)", fontSize:"var(--sm)" }}>
              ★ {selected.rating} · {selected.time} · ₹{selected.cost} for two
            </div>
            {selected.offer && <span className="badge badge-ok" style={{ marginTop:"var(--s1)" }}>{selected.offer}</span>}
          </div>
        </div>

        <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s4)" }}>
          <label style={{ display:"flex", alignItems:"center", gap:"var(--s2)", cursor:"pointer",
            fontSize:"var(--sm)", color:"var(--ok)" }}>
            <input type="checkbox" checked={vegOnly} onChange={e=>setVegOnly(e.target.checked)}
              style={{ accentColor:"var(--ok)" }} />
            Veg Only
          </label>
        </div>

        <div style={{ display:"flex", gap:"var(--s5)", flexWrap:"wrap" }}>
          <div style={{ flex:2, minWidth:280 }}>
            {filteredMenu.map(item => (
              <div key={item.id} style={{ display:"flex", gap:"var(--s4)", alignItems:"center",
                background:"var(--glass2)", border:"1px solid var(--gb)", borderRadius:"var(--r2)",
                padding:"var(--s4)", marginBottom:"var(--s3)" }}>
                <span style={{ fontSize:40 }}>{item.img}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"var(--s2)", marginBottom:"var(--s1)" }}>
                    <div style={{ width:12, height:12, borderRadius:2,
                      border:`2px solid ${item.veg?"var(--ok)":"var(--err)"}`,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%",
                        background:item.veg?"var(--ok)":"var(--err)" }} />
                    </div>
                    <span style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{item.name}</span>
                  </div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginBottom:"var(--s2)" }}>{item.desc}</div>
                  <div style={{ fontWeight:800, color:"var(--ok)" }}>₹{item.price}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"var(--s2)" }}>
                  {cart[item.id] ? (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(item.id)}>−</button>
                      <span style={{ fontWeight:700, minWidth:20, textAlign:"center" }}>{cart[item.id].qty}</span>
                      <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>+</button>
                    </>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>Add</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cart */}
          {cartCount > 0 && (
            <div style={{ minWidth:200, flex:"0 0 200px" }}>
              <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r2)", padding:"var(--s4)", position:"sticky", top:0 }}>
                <div className="label" style={{ marginBottom:"var(--s3)" }}>
                  Cart ({cartCount} items)
                </div>
                {cartItems.map(i => (
                  <div key={i.id} style={{ display:"flex", justifyContent:"space-between",
                    fontSize:"var(--xs)", padding:"var(--s1) 0", borderBottom:"1px solid var(--gb)" }}>
                    <span style={{ color:"var(--t1)" }}>{i.name} ×{i.qty}</span>
                    <span style={{ color:"var(--ok)", fontWeight:700 }}>₹{i.price*i.qty}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"var(--s2) 0",
                  fontWeight:800 }}>
                  <span>Total</span>
                  <span style={{ color:"var(--ok)" }}>₹{cartTotal}</span>
                </div>
                <button className="btn btn-primary" style={{ width:"100%", marginTop:"var(--s3)" }}
                  onClick={() => setStep("checkout")}>
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">🍔 Food Delivery App</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Swiggy, Zomato, Gojek.</strong> Restaurant listing with filters, menu with
        cart, checkout flow, order tracking simulation.
      </p>

      <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s5)", flexWrap:"wrap" }}>
        <input className="input" style={{ flex:1 }} placeholder="Search restaurants..."
          value={search} onChange={e=>setSearch(e.target.value)} />
        {cuisines.map(c => (
          <button key={c} className={`btn btn-sm ${cuisine===c?"btn-primary":"btn-ghost"}`}
            onClick={() => setCuisine(c)}>{c}</button>
        ))}
        <select className="select" style={{ width:"auto" }} value={sortBy}
          onChange={e=>setSortBy(e.target.value)}>
          <option value="rating">Top Rated</option>
          <option value="time">Fastest</option>
          <option value="cost">Low Cost</option>
        </select>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"var(--s4)" }}>
        {filtered.map(r => (
          <div key={r.id}
            onClick={() => { setSelected(r); setStep("menu"); }}
            style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", overflow:"hidden", cursor:"pointer", transition:"all var(--tr)" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.borderColor="var(--a)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor="var(--gb)"; }}>
            <div style={{ height:120, background:"var(--glass)", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:56, position:"relative" }}>
              {r.img}
              {r.offer && (
                <span style={{ position:"absolute", bottom:8, left:8, background:"var(--ok)",
                  color:"#fff", fontSize:"var(--xs)", fontWeight:700, padding:"2px 8px",
                  borderRadius:"var(--pill)" }}>{r.offer}</span>
              )}
            </div>
            <div style={{ padding:"var(--s3)" }}>
              <div style={{ fontWeight:700, color:"var(--t1)", marginBottom:"var(--s1)" }}>{r.name}</div>
              <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginBottom:"var(--s2)" }}>
                {r.cuisine}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--xs)" }}>
                <span style={{ color:"#f59e0b", fontWeight:700 }}>★ {r.rating}</span>
                <span style={{ color:"var(--t2)" }}>{r.time}</span>
                <span style={{ color:"var(--t2)" }}>₹{r.cost} for 2</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
