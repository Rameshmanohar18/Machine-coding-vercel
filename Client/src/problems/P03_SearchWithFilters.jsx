/**
 * PROBLEM 3 — Product Search with Filters + Sort
 * ─────────────────────────────────────────────────────────────
 * Asked at: Amazon, Flipkart, Intuit
 *
 * Requirements:
 * - Search by name (debounced 300ms)
 * - Filter by category (multi-select)
 * - Filter by price range (slider)
 * - Filter by rating (min stars)
 * - Sort by price / rating / name
 * - Show result count
 * - Clear all filters
 * - URL-sync (bonus)
 */

import { useState, useMemo, useCallback } from "react";

const PRODUCTS = [
  { id:1,  name:"MacBook Pro 14",    category:"Laptops",  price:199999, rating:4.8, brand:"Apple"   },
  { id:2,  name:"Dell XPS 15",       category:"Laptops",  price:149999, rating:4.5, brand:"Dell"    },
  { id:3,  name:"iPhone 15 Pro",     category:"Phones",   price:134999, rating:4.7, brand:"Apple"   },
  { id:4,  name:"Samsung S24 Ultra", category:"Phones",   price:124999, rating:4.6, brand:"Samsung" },
  { id:5,  name:"Sony WH-1000XM5",   category:"Audio",    price:29999,  rating:4.9, brand:"Sony"    },
  { id:6,  name:"AirPods Pro 2",     category:"Audio",    price:24999,  rating:4.7, brand:"Apple"   },
  { id:7,  name:"iPad Pro 12.9",     category:"Tablets",  price:109999, rating:4.6, brand:"Apple"   },
  { id:8,  name:"Surface Pro 9",     category:"Tablets",  price:119999, rating:4.3, brand:"Microsoft"},
  { id:9,  name:"LG 4K Monitor",     category:"Monitors", price:49999,  rating:4.4, brand:"LG"      },
  { id:10, name:"Samsung 32\" 4K",   category:"Monitors", price:39999,  rating:4.2, brand:"Samsung" },
  { id:11, name:"Logitech MX Keys",  category:"Keyboards",price:9999,   rating:4.6, brand:"Logitech"},
  { id:12, name:"Keychron K2",       category:"Keyboards",price:7999,   rating:4.5, brand:"Keychron"},
];

const CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))];
const MAX_PRICE   = Math.max(...PRODUCTS.map(p => p.price));

function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useMemo(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

export default function ProductSearch() {
  const [search,     setSearch]     = useState("");
  const [categories, setCategories] = useState([]);
  const [maxPrice,   setMaxPrice]   = useState(MAX_PRICE);
  const [minRating,  setMinRating]  = useState(0);
  const [sortBy,     setSortBy]     = useState("name");
  const [sortDir,    setSortDir]    = useState("asc");

  const debouncedSearch = useDebounce(search, 300);

  const toggleCategory = useCallback((cat) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const clearAll = () => {
    setSearch(""); setCategories([]); setMaxPrice(MAX_PRICE);
    setMinRating(0); setSortBy("name"); setSortDir("asc");
  };

  const results = useMemo(() => {
    let list = PRODUCTS.filter(p => {
      if (debouncedSearch && !p.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (categories.length && !categories.includes(p.category)) return false;
      if (p.price > maxPrice) return false;
      if (p.rating < minRating) return false;
      return true;
    });

    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === "price")  diff = a.price  - b.price;
      if (sortBy === "rating") diff = a.rating  - b.rating;
      if (sortBy === "name")   diff = a.name.localeCompare(b.name);
      return sortDir === "asc" ? diff : -diff;
    });

    return list;
  }, [debouncedSearch, categories, maxPrice, minRating, sortBy, sortDir]);

  const hasFilters = search || categories.length || maxPrice < MAX_PRICE || minRating > 0;

  return (
    <div className="card">
      <h2 className="card-title">🔍 Product Search + Filters</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at Amazon, Flipkart, Intuit.</strong> Debounced search, multi-select category
        filter, price range slider, star rating filter, sort with direction toggle.
        All filtering done client-side with <code>useMemo</code>.
      </p>

      <div style={{ display: "flex", gap: "var(--s6)", flexWrap: "wrap" }}>
        {/* ── Filters sidebar ── */}
        <div style={{ minWidth: 220, flex: "0 0 220px" }}>

          {/* Search */}
          <div className="form-row">
            <label className="label">Search</label>
            <input className="input" placeholder="Search products..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Categories */}
          <div style={{ marginBottom: "var(--s5)" }}>
            <div className="label" style={{ marginBottom: "var(--s2)" }}>Category</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s1)" }}>
              {CATEGORIES.map(cat => (
                <label key={cat} style={{ display: "flex", alignItems: "center", gap: "var(--s2)",
                  cursor: "pointer", fontSize: "var(--sm)", color: categories.includes(cat) ? "var(--a2)" : "var(--t2)" }}>
                  <input type="checkbox" checked={categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    style={{ accentColor: "var(--a2)", width: 14, height: 14 }} />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div style={{ marginBottom: "var(--s5)" }}>
            <div className="label" style={{ marginBottom: "var(--s2)" }}>
              Max Price: <span style={{ color: "var(--a2)" }}>₹{maxPrice.toLocaleString()}</span>
            </div>
            <input type="range" min={0} max={MAX_PRICE} step={1000}
              value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--a)" }} />
          </div>

          {/* Min rating */}
          <div style={{ marginBottom: "var(--s5)" }}>
            <div className="label" style={{ marginBottom: "var(--s2)" }}>
              Min Rating: <span style={{ color: "var(--warn)" }}>{"★".repeat(minRating) || "Any"}</span>
            </div>
            <div style={{ display: "flex", gap: "var(--s1)" }}>
              {[0,3,4,4.5].map(r => (
                <button key={r}
                  className={`btn btn-sm ${minRating === r ? "btn-warn" : "btn-ghost"}`}
                  onClick={() => setMinRating(r)}>
                  {r === 0 ? "All" : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button className="btn btn-danger btn-sm" style={{ width: "100%" }} onClick={clearAll}>
              ✕ Clear All Filters
            </button>
          )}
        </div>

        {/* ── Results ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Sort bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "var(--s4)", flexWrap: "wrap", gap: "var(--s2)" }}>
            <span style={{ color: "var(--t2)", fontSize: "var(--sm)" }}>
              <strong style={{ color: "var(--a2)" }}>{results.length}</strong> results
            </span>
            <div style={{ display: "flex", gap: "var(--s2)" }}>
              {["name","price","rating"].map(s => (
                <button key={s}
                  className={`btn btn-sm ${sortBy === s ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => { if (sortBy === s) setSortDir(d => d === "asc" ? "desc" : "asc"); else setSortBy(s); }}>
                  {s} {sortBy === s ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--s3)" }}>
            {results.map(p => (
              <div key={p.id} style={{
                background: "var(--glass2)", border: "1px solid var(--gb)",
                borderRadius: "var(--r2)", padding: "var(--s4)",
                transition: "all var(--tr)"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--a)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--gb)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: "var(--xs)", color: "var(--a2)", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "var(--s1)" }}>
                  {p.category}
                </div>
                <div style={{ fontWeight: 700, color: "var(--t1)", marginBottom: "var(--s2)",
                  fontSize: "var(--sm)", lineHeight: 1.4 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: "var(--xs)", color: "var(--t3)", marginBottom: "var(--s3)" }}>
                  {p.brand}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, color: "var(--ok)", fontSize: "var(--md)" }}>
                    ₹{p.price.toLocaleString()}
                  </span>
                  <span style={{ color: "#f59e0b", fontSize: "var(--sm)", fontWeight: 700 }}>
                    ★ {p.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && (
            <div style={{ textAlign: "center", padding: "var(--s10)", color: "var(--t3)" }}>
              No products match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
