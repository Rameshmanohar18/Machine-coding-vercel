/**
 * PROBLEM 37 — Trading / Investment Dashboard
 * Asked at: Groww, Zerodha, DE Shaw, Arcesium, Fidelity
 *
 * Requirements:
 * - Live candlestick-style chart (SVG)
 * - Order book (bid/ask)
 * - Place buy/sell orders (market/limit)
 * - Portfolio P&L with live updates
 * - Watchlist with price alerts
 * - Order history
 * - Market depth visualization
 * - Circuit breaker indicator
 */

import { useState, useEffect, useRef, useCallback } from "react";

const STOCKS = [
  { symbol:"RELIANCE", name:"Reliance Industries", price:2850, change:1.2  },
  { symbol:"TCS",      name:"TCS",                 price:3920, change:-0.5 },
  { symbol:"INFY",     name:"Infosys",             price:1580, change:0.8  },
  { symbol:"HDFC",     name:"HDFC Bank",           price:1720, change:-0.3 },
  { symbol:"NIFTY50",  name:"Nifty 50",            price:22450,change:0.6  },
];

function genCandles(base, count=30) {
  const candles = [];
  let price = base;
  for (let i = 0; i < count; i++) {
    const open  = price;
    const close = price + (Math.random()-0.48)*price*0.015;
    const high  = Math.max(open,close) + Math.random()*price*0.005;
    const low   = Math.min(open,close) - Math.random()*price*0.005;
    candles.push({ open, close, high, low });
    price = close;
  }
  return candles;
}

function CandlestickChart({ candles, w=400, h=160 }) {
  if (!candles.length) return null;
  const prices = candles.flatMap(c=>[c.high,c.low]);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const toY = (p) => h - ((p-minP)/range)*h;
  const cw = w/candles.length;

  return (
    <svg width={w} height={h} style={{ display:"block" }}>
      {candles.map((c,i) => {
        const x    = i*cw + cw*0.1;
        const barW = cw*0.8;
        const isUp = c.close >= c.open;
        const color= isUp ? "#10b981" : "#ef4444";
        const bodyTop = toY(Math.max(c.open,c.close));
        const bodyH   = Math.max(1, Math.abs(toY(c.open)-toY(c.close)));
        return (
          <g key={i}>
            {/* Wick */}
            <line x1={x+barW/2} y1={toY(c.high)} x2={x+barW/2} y2={toY(c.low)}
              stroke={color} strokeWidth={1} />
            {/* Body */}
            <rect x={x} y={bodyTop} width={barW} height={bodyH}
              fill={color} opacity={0.85} rx={1} />
          </g>
        );
      })}
    </svg>
  );
}

let orderId = 1000;

export default function TradingDashboard() {
  const [activeStock, setActiveStock] = useState("RELIANCE");
  const [prices,      setPrices]      = useState(
    Object.fromEntries(STOCKS.map(s=>[s.symbol,s.price]))
  );
  const [candles,     setCandles]     = useState(
    Object.fromEntries(STOCKS.map(s=>[s.symbol,genCandles(s.price)]))
  );
  const [orderType,   setOrderType]   = useState("market"); // market | limit
  const [side,        setSide]        = useState("buy");
  const [qty,         setQty]         = useState("10");
  const [limitPrice,  setLimitPrice]  = useState("");
  const [orders,      setOrders]      = useState([]);
  const [portfolio,   setPortfolio]   = useState({
    RELIANCE:{ qty:10, avgPrice:2800 },
    TCS:     { qty:5,  avgPrice:3900 },
  });
  const [paused,      setPaused]      = useState(false);

  const tick = useCallback(() => {
    setPrices(prev => {
      const next = {};
      STOCKS.forEach(s => {
        next[s.symbol] = Math.max(1, prev[s.symbol] + (Math.random()-0.49)*prev[s.symbol]*0.003);
      });
      return next;
    });
    setCandles(prev => {
      const next = {};
      STOCKS.forEach(s => {
        const last = prev[s.symbol];
        const price = prices[s.symbol] || s.price;
        const newCandle = {
          open:  last[last.length-1]?.close || price,
          close: price + (Math.random()-0.49)*price*0.008,
          high:  0, low:0
        };
        newCandle.high = Math.max(newCandle.open,newCandle.close) + Math.random()*price*0.003;
        newCandle.low  = Math.min(newCandle.open,newCandle.close) - Math.random()*price*0.003;
        next[s.symbol] = [...last.slice(-29), newCandle];
      });
      return next;
    });
  }, [prices]);

  useEffect(() => {
    if (!paused) {
      const t = setInterval(tick, 1500);
      return () => clearInterval(t);
    }
  }, [paused, tick]);

  const placeOrder = () => {
    const price = orderType==="limit" ? Number(limitPrice) : prices[activeStock];
    if (!qty || Number(qty)<=0) return;
    if (orderType==="limit" && !limitPrice) return;

    const order = {
      id:`ORD-${orderId++}`, symbol:activeStock, side, qty:Number(qty),
      price, type:orderType, status:"executed", time:new Date().toLocaleTimeString()
    };
    setOrders(o => [order, ...o].slice(0,10));

    if (side==="buy") {
      setPortfolio(p => {
        const existing = p[activeStock];
        if (existing) {
          const totalQty = existing.qty + Number(qty);
          const avgPrice = (existing.qty*existing.avgPrice + Number(qty)*price) / totalQty;
          return { ...p, [activeStock]:{ qty:totalQty, avgPrice } };
        }
        return { ...p, [activeStock]:{ qty:Number(qty), avgPrice:price } };
      });
    } else {
      setPortfolio(p => {
        const existing = p[activeStock];
        if (!existing) return p;
        const newQty = existing.qty - Number(qty);
        if (newQty <= 0) { const np={...p}; delete np[activeStock]; return np; }
        return { ...p, [activeStock]:{ ...existing, qty:newQty } };
      });
    }
  };

  const stock = STOCKS.find(s=>s.symbol===activeStock);
  const currentPrice = prices[activeStock];
  const holding = portfolio[activeStock];
  const pnl = holding ? (currentPrice - holding.avgPrice) * holding.qty : 0;

  // Generate order book
  const asks = Array.from({length:5},(_,i) => ({
    price: currentPrice + (i+1)*currentPrice*0.001,
    qty:   Math.floor(Math.random()*500+100)
  }));
  const bids = Array.from({length:5},(_,i) => ({
    price: currentPrice - (i+1)*currentPrice*0.001,
    qty:   Math.floor(Math.random()*500+100)
  }));

  const totalPortfolioPnL = Object.entries(portfolio).reduce((sum,[sym,h]) => {
    return sum + (prices[sym]||0 - h.avgPrice) * h.qty;
  }, 0);

  return (
    <div className="card">
      <h2 className="card-title">📈 Trading Dashboard</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Groww, DE Shaw, Arcesium, Zerodha.</strong> Live candlestick chart,
        order book, buy/sell orders, portfolio P&L, market/limit orders.
      </p>

      {/* Stock selector */}
      <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s5)", flexWrap:"wrap" }}>
        {STOCKS.map(s => {
          const p = prices[s.symbol];
          const chg = ((p - s.price)/s.price*100);
          return (
            <button key={s.symbol}
              onClick={() => setActiveStock(s.symbol)}
              style={{ padding:"var(--s2) var(--s4)", borderRadius:"var(--r2)", cursor:"pointer",
                fontFamily:"var(--font)", border:`1px solid ${activeStock===s.symbol?"var(--a)":"var(--gb)"}`,
                background:activeStock===s.symbol?"var(--abg)":"var(--glass2)",
                transition:"all var(--tr)" }}>
              <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{s.symbol}</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:"var(--xs)", color:"var(--a2)" }}>
                ₹{p.toFixed(0)}
              </div>
              <div style={{ fontSize:"var(--xs)", color:chg>=0?"var(--ok)":"var(--err)", fontWeight:700 }}>
                {chg>=0?"+":""}{chg.toFixed(2)}%
              </div>
            </button>
          );
        })}
        <button className={`btn btn-sm ${paused?"btn-success":"btn-danger"}`}
          style={{ marginLeft:"auto" }} onClick={() => setPaused(p=>!p)}>
          {paused?"▶ Resume":"⏸ Pause"}
        </button>
      </div>

      <div style={{ display:"flex", gap:"var(--s5)", flexWrap:"wrap" }}>
        {/* Chart + order book */}
        <div style={{ flex:2, minWidth:300 }}>
          {/* Price header */}
          <div style={{ display:"flex", gap:"var(--s4)", alignItems:"baseline", marginBottom:"var(--s3)" }}>
            <span style={{ fontSize:"var(--2xl)", fontWeight:800, color:"var(--t1)",
              fontFamily:"var(--mono)" }}>₹{currentPrice.toFixed(2)}</span>
            <span style={{ color:pnl>=0?"var(--ok)":"var(--err)", fontWeight:700 }}>
              {pnl>=0?"+":""}{((currentPrice-stock.price)/stock.price*100).toFixed(2)}%
            </span>
          </div>

          <CandlestickChart candles={candles[activeStock]} w={400} h={160} />

          {/* Order book */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--s3)", marginTop:"var(--s4)" }}>
            <div>
              <div style={{ fontSize:"var(--xs)", color:"var(--err)", fontWeight:700,
                textTransform:"uppercase", letterSpacing:".08em", marginBottom:"var(--s2)" }}>
                Asks (Sell)
              </div>
              {asks.map((a,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                  fontSize:"var(--xs)", padding:"2px 0", color:"var(--err)" }}>
                  <span style={{ fontFamily:"var(--mono)" }}>₹{a.price.toFixed(1)}</span>
                  <span style={{ color:"var(--t2)" }}>{a.qty}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:"var(--xs)", color:"var(--ok)", fontWeight:700,
                textTransform:"uppercase", letterSpacing:".08em", marginBottom:"var(--s2)" }}>
                Bids (Buy)
              </div>
              {bids.map((b,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                  fontSize:"var(--xs)", padding:"2px 0", color:"var(--ok)" }}>
                  <span style={{ fontFamily:"var(--mono)" }}>₹{b.price.toFixed(1)}</span>
                  <span style={{ color:"var(--t2)" }}>{b.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order panel + portfolio */}
        <div style={{ flex:1, minWidth:220, display:"flex", flexDirection:"column", gap:"var(--s4)" }}>
          {/* Place order */}
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            <div style={{ display:"flex", gap:"var(--s1)", marginBottom:"var(--s4)" }}>
              {["buy","sell"].map(s => (
                <button key={s}
                  className={`btn btn-sm ${side===s?(s==="buy"?"btn-success":"btn-danger"):"btn-ghost"}`}
                  style={{ flex:1 }} onClick={() => setSide(s)}>
                  {s==="buy"?"📈 Buy":"📉 Sell"}
                </button>
              ))}
            </div>

            <div style={{ display:"flex", gap:"var(--s1)", marginBottom:"var(--s3)" }}>
              {["market","limit"].map(t => (
                <button key={t} className={`btn btn-sm ${orderType===t?"btn-primary":"btn-ghost"}`}
                  style={{ flex:1 }} onClick={() => setOrderType(t)}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            <div className="form-row" style={{ marginBottom:"var(--s3)" }}>
              <label className="label">Quantity</label>
              <input className="input" type="number" min={1} value={qty}
                onChange={e=>setQty(e.target.value)} />
            </div>

            {orderType==="limit" && (
              <div className="form-row" style={{ marginBottom:"var(--s3)" }}>
                <label className="label">Limit Price</label>
                <input className="input" type="number" value={limitPrice}
                  onChange={e=>setLimitPrice(e.target.value)}
                  placeholder={`~₹${currentPrice.toFixed(0)}`} />
              </div>
            )}

            <div style={{ background:"var(--glass)", borderRadius:"var(--r1)", padding:"var(--s2) var(--s3)",
              marginBottom:"var(--s3)", fontSize:"var(--xs)", color:"var(--t2)" }}>
              Est. value: ₹{(Number(qty||0) * (orderType==="limit"?Number(limitPrice||0):currentPrice)).toLocaleString()}
            </div>

            <button
              className={`btn ${side==="buy"?"btn-success":"btn-danger"}`}
              style={{ width:"100%" }} onClick={placeOrder}>
              {side==="buy"?"Buy":"Sell"} {activeStock}
            </button>
          </div>

          {/* Portfolio */}
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>Portfolio</div>
            {Object.entries(portfolio).map(([sym,h]) => {
              const p = prices[sym] || 0;
              const pl = (p - h.avgPrice) * h.qty;
              return (
                <div key={sym} style={{ marginBottom:"var(--s3)", paddingBottom:"var(--s3)",
                  borderBottom:"1px solid var(--gb)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{sym}</span>
                    <span style={{ color:pl>=0?"var(--ok)":"var(--err)", fontWeight:700, fontSize:"var(--sm)" }}>
                      {pl>=0?"+":""}₹{pl.toFixed(0)}
                    </span>
                  </div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
                    {h.qty} shares · avg ₹{h.avgPrice.toFixed(0)}
                  </div>
                </div>
              );
            })}
            <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800 }}>
              <span style={{ color:"var(--t1)" }}>Total P&L</span>
              <span style={{ color:totalPortfolioPnL>=0?"var(--ok)":"var(--err)" }}>
                {totalPortfolioPnL>=0?"+":""}₹{totalPortfolioPnL.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Recent orders */}
          {orders.length > 0 && (
            <div>
              <div className="label" style={{ marginBottom:"var(--s2)" }}>Recent Orders</div>
              {orders.slice(0,4).map(o => (
                <div key={o.id} style={{ display:"flex", justifyContent:"space-between",
                  fontSize:"var(--xs)", padding:"4px 0", borderBottom:"1px solid var(--gb)",
                  color:"var(--t2)" }}>
                  <span style={{ color:o.side==="buy"?"var(--ok)":"var(--err)", fontWeight:700 }}>
                    {o.side.toUpperCase()}
                  </span>
                  <span>{o.symbol}</span>
                  <span>{o.qty} @ ₹{o.price.toFixed(0)}</span>
                  <span style={{ color:"var(--ok)" }}>{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
