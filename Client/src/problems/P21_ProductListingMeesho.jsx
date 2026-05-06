/**
 * PROBLEM 21 — Product Listing Page (Meesho / Flipkart)
 * ─────────────────────────────────────────────────────────────
 * Asked at: Meesho, Flipkart
 *
 * Requirements:
 * - Grid/List view toggle
 * - Multi-select filters: category, brand, price range, rating
 * - Sort: price asc/desc, rating, newest
 * - Add to cart / wishlist
 * - Cart count in header
 * - Skeleton loading state
 * - "No results" empty state
 * - Active filter chips with remove
 */

import { useState, useMemo } from "react";

const PRODUCTS = [
  { id:1,  name:"Floral Kurti",         brand:"Biba",      category:"Women",    price:599,  rating:4.3, img:"👗", isNew:true  },
  { id:2,  name:"Men's Polo T-Shirt",   brand:"Allen Solly",category:"Men",     price:799,  rating:4.1, img:"👕", isNew:false },
  { id:3,  name:"Kids Frock",           brand:"Hopscotch",  category:"Kids",    price:449,  rating:4.5, img:"👚", isNew:true  },
  { id:4,  name:"Ethnic Saree",         brand:"Fabindia",   category:"Women",   price:1299, rating:4.7, img:"🥻", isNew:false },
  { id:5,  name:"Denim Jeans",          brand:"Levis",      category:"Men",     price:1499, rating:4.4, img:"👖", isNew:false },
  { id:6,  name:"Sports Shoes",         brand:"Nike",       category:"Footwear",price:2999, rating:4.6, img:"👟", isNew:true  },
  { id:7,  name:"Casual Sneakers",      brand:"Puma",       category:"Footwear",price:1999, rating:4.2, img:"👟", isNew:false },
  { id:8,  name:"Handbag",              brand:"Caprese",    category:"Women",   price:899,  rating:4.0, img:"👜", isNew:true  },
  { id:9,  name:"Kids Sneakers",        brand:"Bata",       category:"Kids",    price:599,  rating:4.3, img:"👟", isNew:false },
  { id:10, name:"Formal Shirt",         brand:"Van Heusen", category:"Men",     price:1199, rating:4.5, img:"👔", isNew:true  },
  { id:11, name:"Leggings",             brand:"Jockey",     category:"Women",   price:349,  rating:4.1, img:"🩱", isNew:false },
  { id:12, name:"Backpack",             brand:"Wildcraft",  category:"Bags",    price:1599, rating:4.4, img:"🎒", isNew:true  },
];

const CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))];
const BRANDS     = [...new Set(PRODUCTS.map(p => p.brand))];

function SkeletonCard() {
  return (
    <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
      borderRadius:"var(--r2)", overflow:"hidden", animation:"pulse 1.4s ease infinite" }}>
      <div style={{ height:160, background:"var(--glass)" }} />
      <div style={{ padding:"var(--s3)" }}>
        <div style={{ height:12, background:"var(--gb2)", borderRadius:4, marginBottom:6, width:"80%" }} />
        <div style={{ height:10, background:"var(--gb)",  borderRadius:4, width:"50%" }} />
      </div>
    </div>
  );
}

export default function ProductListingMeesho() {
  const [view,       setView]       = useState("grid");
  const [cart,       setCart]       = useState([]);
  const [wishlist,   setWishlist]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [selCats,    setSelCats]    = useState([]);
  const [selBrands,  setSelBrands]  = useState([]);
  const [maxPrice,   setMaxPrice]   = useState(3000);
  const [minRating,  setMinRating]  = useState(0);
  const [sortBy,     setSortBy]     = useState("default");

  const toggleFilter = (arr, setArr, val) =>
    setArr(a => a.includes(val) ? a.filter(x => x !== val) : [...a, val]);

  const activeFilters = [
    ...selCats.map(c => ({ label:c, remove:() => toggleFilter(selCats, setSelCats, c) })),
    ...selBrands.map(b => ({ label:b, remove:() => toggleFilter(selBrands, setSelBrands, b) })),
    ...(maxPrice < 3000 ? [{ label:`≤₹${maxPrice}`, remove:() => setMaxPrice(3000) }] : []),
    ...(minRating > 0   ? [{ label:`${minRating}★+`, remove:() => setMinRating(0) }] : []),
  ];

  const results = useMemo(() => {
    let list = PRODUCTS.filter(p => {
      if (selCats.length   && !selCats.includes(p.category))   return false;
      if (selBrands.length && !selBrands.includes(p.brand))    return false;
      if (p.price > maxPrice)  return false;
      if (p.rating < minRating) return false;
      return true;
    });
    if (sortBy === "price-asc")  list = [...list].sort((a,b) => a.price - b.price);
    if (sortBy === "price-desc") list = [...list].sort((a,b) => b.price - a.price);
    if (sortBy === "rating")     list = [...list].sort((a,b) => b.rating - a.rating);
    if (sortBy === "newest")     list = [...list].filter(p => p.isNew).concat(list.filter(p => !p.isNew));
    return list;
  }, [selCats, selBrands, maxPrice, minRating, sortBy]);

  const addToCart = (id) => setCart(c => c.includes(id) ? c : [...c, id]);
  const toggleWish = (id) => setWishlist(w => w.includes(id) ? w.filter(x=>x!==id) : [...w, id]);

  const simulateLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"var(--s5)" }}>
        <h2 style={{ margin:0 }}>🛍 Product Listing</h2>
        <div style={{ display:"flex", gap:"var(--s3)", alignItems:"center" }}>
          <button className="btn btn-ghost btn-sm" onClick={simulateLoad}>↺ Reload</button>
          <span style={{ fontSize:"var(--sm)", color:"var(--t2)" }}>
            🛒 <strong style={{ color:"var(--a2)" }}>{cart.length}</strong>
          </span>
          <button className={`btn btn-sm ${view==="grid"?"btn-primary":"btn-ghost"}`} onClick={() => setView("grid")}>⊞</button>
          <button className={`btn btn-sm ${view==="list"?"btn-primary":"btn-ghost"}`} onClick={() => setView("list")}>☰</button>
        </div>
      </div>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Meesho, Flipkart.</strong> Grid/list toggle, multi-filter with chips,
        sort, add to cart/wishlist, skeleton loading, empty state.
      </p>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* Filters */}
        <div style={{ minWidth:200, flex:"0 0 200px" }}>
          <div className="label" style={{ marginBottom:"var(--s3)" }}>Filters</div>

          {/* Category */}
          <div style={{ marginBottom:"var(--s4)" }}>
            <div style={{ fontSize:"var(--xs)", fontWeight:700, color:"var(--t2)", marginBottom:"var(--s2)",
              textTransform:"uppercase", letterSpacing:".06em" }}>Category</div>
            {CATEGORIES.map(c => (
              <label key={c} style={{ display:"flex", alignItems:"center", gap:"var(--s2)",
                fontSize:"var(--sm)", color:selCats.includes(c)?"var(--a2)":"var(--t2)",
                cursor:"pointer", marginBottom:"var(--s1)" }}>
                <input type="checkbox" checked={selCats.includes(c)}
                  onChange={() => toggleFilter(selCats, setSelCats, c)}
                  style={{ accentColor:"var(--a2)" }} />
                {c}
              </label>
            ))}
          </div>

          {/* Brand */}
          <div style={{ marginBottom:"var(--s4)" }}>
            <div style={{ fontSize:"var(--xs)", fontWeight:700, color:"var(--t2)", marginBottom:"var(--s2)",
              textTransform:"uppercase", letterSpacing:".06em" }}>Brand</div>
            {BRANDS.map(b => (
              <label key={b} style={{ display:"flex", alignItems:"center", gap:"var(--s2)",
                fontSize:"var(--sm)", color:selBrands.includes(b)?"var(--a2)":"var(--t2)",
                cursor:"pointer", marginBottom:"var(--s1)" }}>
                <input type="checkbox" checked={selBrands.includes(b)}
                  onChange={() => toggleFilter(selBrands, setSelBrands, b)}
                  style={{ accentColor:"var(--a2)" }} />
                {b}
              </label>
            ))}
          </div>

          {/* Price */}
          <div style={{ marginBottom:"var(--s4)" }}>
            <div style={{ fontSize:"var(--xs)", fontWeight:700, color:"var(--t2)", marginBottom:"var(--s2)",
              textTransform:"uppercase", letterSpacing:".06em" }}>
              Max Price: <span style={{ color:"var(--a2)" }}>₹{maxPrice}</span>
            </div>
            <input type="range" min={300} max={3000} step={100} value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ width:"100%", accentColor:"var(--a)" }} />
          </div>

          {/* Rating */}
          <div>
            <div style={{ fontSize:"var(--xs)", fontWeight:700, color:"var(--t2)", marginBottom:"var(--s2)",
              textTransform:"uppercase", letterSpacing:".06em" }}>Min Rating</div>
            <div style={{ display:"flex", gap:"var(--s1)" }}>
              {[0,3,4,4.5].map(r => (
                <button key={r} className={`btn btn-sm ${minRating===r?"btn-warn":"btn-ghost"}`}
                  onClick={() => setMinRating(r)}>
                  {r===0?"All":`${r}★`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Sort + active chips */}
          <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s4)", flexWrap:"wrap", alignItems:"center" }}>
            <select className="select" style={{ width:"auto" }} value={sortBy}
              onChange={e => setSortBy(e.target.value)}>
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest First</option>
            </select>
            <span style={{ fontSize:"var(--sm)", color:"var(--t2)" }}>
              {results.length} products
            </span>
            {activeFilters.map((f, i) => (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"var(--s1)",
                background:"var(--abg)", border:"1px solid rgba(124,58,237,.3)",
                borderRadius:"var(--pill)", padding:"2px 10px", fontSize:"var(--xs)", color:"var(--a2)" }}>
                {f.label}
                <button onClick={f.remove} style={{ background:"none", border:"none",
                  cursor:"pointer", color:"var(--a2)", fontSize:12, padding:0, lineHeight:1 }}>✕</button>
              </span>
            ))}
          </div>

          {/* Skeleton */}
          {loading && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"var(--s3)" }}>
              {[...Array(6)].map((_,i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && results.length === 0 && (
            <div style={{ textAlign:"center", padding:"var(--s10)", color:"var(--t3)" }}>
              <div style={{ fontSize:48, marginBottom:"var(--s3)" }}>🔍</div>
              <div style={{ fontWeight:700, color:"var(--t1)", marginBottom:"var(--s2)" }}>No products found</div>
              <div style={{ fontSize:"var(--sm)" }}>Try adjusting your filters</div>
            </div>
          )}

          {/* Grid */}
          {!loading && results.length > 0 && view === "grid" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"var(--s3)" }}>
              {results.map(p => (
                <div key={p.id} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                  borderRadius:"var(--r2)", overflow:"hidden", transition:"all var(--tr)" }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.borderColor="var(--a)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor="var(--gb)"; }}>
                  <div style={{ height:120, display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:56, background:"var(--glass)", position:"relative" }}>
                    {p.img}
                    {p.isNew && <span style={{ position:"absolute", top:8, left:8,
                      background:"var(--ok)", color:"#fff", fontSize:"var(--xs)", fontWeight:700,
                      padding:"2px 6px", borderRadius:"var(--pill)" }}>NEW</span>}
                    <button onClick={() => toggleWish(p.id)}
                      style={{ position:"absolute", top:8, right:8, background:"none", border:"none",
                        cursor:"pointer", fontSize:18 }}>
                      {wishlist.includes(p.id) ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div style={{ padding:"var(--s3)" }}>
                    <div style={{ fontWeight:600, color:"var(--t1)", fontSize:"var(--sm)",
                      marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginBottom:"var(--s2)" }}>
                      {p.brand}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      marginBottom:"var(--s2)" }}>
                      <span style={{ fontWeight:800, color:"var(--ok)" }}>₹{p.price}</span>
                      <span style={{ fontSize:"var(--xs)", color:"#f59e0b" }}>★{p.rating}</span>
                    </div>
                    <button className={`btn btn-sm ${cart.includes(p.id)?"btn-success":"btn-primary"}`}
                      style={{ width:"100%" }} onClick={() => addToCart(p.id)}>
                      {cart.includes(p.id) ? "✓ Added" : "+ Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List */}
          {!loading && results.length > 0 && view === "list" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)" }}>
              {results.map(p => (
                <div key={p.id} style={{ display:"flex", gap:"var(--s4)", alignItems:"center",
                  background:"var(--glass2)", border:"1px solid var(--gb)", borderRadius:"var(--r2)",
                  padding:"var(--s3) var(--s4)", transition:"all var(--tr)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="var(--a)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="var(--gb)"}>
                  <div style={{ fontSize:40, width:60, textAlign:"center", flexShrink:0 }}>{p.img}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{p.name}</div>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{p.brand} · {p.category}</div>
                  </div>
                  <span style={{ color:"#f59e0b", fontSize:"var(--sm)" }}>★{p.rating}</span>
                  <span style={{ fontWeight:800, color:"var(--ok)", fontSize:"var(--md)", minWidth:60, textAlign:"right" }}>
                    ₹{p.price}
                  </span>
                  <button onClick={() => toggleWish(p.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18 }}>
                    {wishlist.includes(p.id) ? "❤️" : "🤍"}
                  </button>
                  <button className={`btn btn-sm ${cart.includes(p.id)?"btn-success":"btn-primary"}`}
                    onClick={() => addToCart(p.id)}>
                    {cart.includes(p.id) ? "✓" : "+ Cart"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
