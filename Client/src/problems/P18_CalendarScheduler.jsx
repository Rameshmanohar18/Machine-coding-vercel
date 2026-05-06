/**
 * PROBLEM 18 — Calendar / Event Scheduler
 * ─────────────────────────────────────────────────────────────
 * Asked at: ServiceNow, VMware, Intuit, Broadcom
 *
 * Requirements:
 * - Monthly calendar view with navigation
 * - Add events on any day (title, time, color, type)
 * - Click day to see events
 * - Event types: Meeting, Deadline, Holiday, Personal
 * - Today highlight
 * - Event count badge per day
 * - Week view toggle
 * - Recurring events (daily/weekly)
 */

import { useState, useMemo } from "react";

const EVENT_TYPES = {
  Meeting:  { color:"#a78bfa", icon:"📅" },
  Deadline: { color:"#ef4444", icon:"⏰" },
  Holiday:  { color:"#10b981", icon:"🎉" },
  Personal: { color:"#f59e0b", icon:"👤" },
};

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

let evtId = 1;

const INITIAL_EVENTS = [
  { id:evtId++, date:"2024-01-15", title:"Team Standup",    type:"Meeting",  time:"09:00", color:"#a78bfa" },
  { id:evtId++, date:"2024-01-20", title:"Project Deadline",type:"Deadline", time:"17:00", color:"#ef4444" },
  { id:evtId++, date:"2024-01-26", title:"Republic Day",    type:"Holiday",  time:"",      color:"#10b981" },
  { id:evtId++, date:"2024-01-10", title:"Dentist",         type:"Personal", time:"11:00", color:"#f59e0b" },
];

export default function CalendarScheduler() {
  const today = new Date();
  const [year,   setYear]   = useState(today.getFullYear());
  const [month,  setMonth]  = useState(today.getMonth());
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selected, setSelected] = useState(null); // "YYYY-MM-DD"
  const [form, setForm] = useState({ title:"", type:"Meeting", time:"09:00" });
  const [view, setView] = useState("month"); // month | week

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => { map[e.date] = [...(map[e.date]||[]), e]; });
    return map;
  }, [events]);

  const addEvent = () => {
    if (!form.title.trim() || !selected) return;
    setEvents(ev => [...ev, { id:evtId++, date:selected, ...form, color:EVENT_TYPES[form.type].color }]);
    setForm({ title:"", type:"Meeting", time:"09:00" });
  };

  const deleteEvent = (id) => setEvents(ev => ev.filter(e => e.id !== id));

  const formatDate = (d) => {
    const dt = new Date(d);
    return `${DAYS[dt.getDay()]}, ${MONTHS[dt.getMonth()]} ${dt.getDate()}`;
  };

  const toDateStr = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const todayStr  = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // Build calendar grid
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card">
      <h2 className="card-title">📅 Calendar Scheduler</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at ServiceNow, VMware, Intuit.</strong> Monthly calendar, add/delete events,
        event type badges, today highlight, day detail panel.
      </p>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* ── Calendar ── */}
        <div style={{ flex:1, minWidth:300 }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            marginBottom:"var(--s4)" }}>
            <button className="btn btn-ghost btn-sm" onClick={prevMonth}>←</button>
            <h3 style={{ margin:0 }}>{MONTHS[month]} {year}</h3>
            <button className="btn btn-ghost btn-sm" onClick={nextMonth}>→</button>
          </div>

          {/* Day headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:2 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign:"center", fontSize:"var(--xs)", fontWeight:700,
                color:"var(--t3)", padding:"var(--s1)", textTransform:"uppercase", letterSpacing:".06em" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateStr = toDateStr(year, month, day);
              const dayEvts = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSel   = dateStr === selected;
              return (
                <div key={day}
                  onClick={() => setSelected(isSel ? null : dateStr)}
                  style={{
                    minHeight:60, padding:"var(--s1) var(--s2)",
                    borderRadius:"var(--r1)", cursor:"pointer",
                    background: isSel ? "var(--abg)" : isToday ? "rgba(124,58,237,0.08)" : "var(--glass)",
                    border:`1px solid ${isSel?"var(--a)":isToday?"var(--a)":"var(--gb)"}`,
                    transition:"all var(--tr)"
                  }}
                >
                  <div style={{ fontWeight: isToday ? 800 : 400,
                    color: isToday ? "var(--a2)" : "var(--t1)",
                    fontSize:"var(--sm)", marginBottom:2 }}>
                    {day}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:2 }}>
                    {dayEvts.slice(0,3).map(e => (
                      <div key={e.id} style={{ width:6, height:6, borderRadius:"50%",
                        background:e.color, flexShrink:0 }} />
                    ))}
                    {dayEvts.length > 3 && (
                      <span style={{ fontSize:9, color:"var(--t3)" }}>+{dayEvts.length-3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Day panel ── */}
        <div style={{ minWidth:240, flex:"0 0 240px" }}>
          {selected ? (
            <>
              <div className="label" style={{ marginBottom:"var(--s3)" }}>
                {formatDate(selected)}
              </div>

              {/* Add event */}
              <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s4)" }}>
                <input className="input" style={{ marginBottom:"var(--s2)" }}
                  placeholder="Event title..." value={form.title}
                  onChange={e => setForm(f => ({ ...f, title:e.target.value }))}
                  onKeyDown={e => e.key==="Enter" && addEvent()} />
                <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s2)" }}>
                  <select className="select" value={form.type}
                    onChange={e => setForm(f => ({ ...f, type:e.target.value }))}>
                    {Object.keys(EVENT_TYPES).map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input className="input" type="time" value={form.time}
                    onChange={e => setForm(f => ({ ...f, time:e.target.value }))} />
                </div>
                <button className="btn btn-primary btn-sm" style={{ width:"100%" }} onClick={addEvent}>
                  + Add Event
                </button>
              </div>

              {/* Events for day */}
              {(eventsByDate[selected]||[]).length === 0
                ? <div style={{ color:"var(--t3)", fontSize:"var(--sm)", textAlign:"center",
                    padding:"var(--s5)" }}>No events</div>
                : (eventsByDate[selected]||[]).map(e => (
                  <div key={e.id} style={{
                    background:"var(--glass2)", border:"1px solid var(--gb)",
                    borderLeft:`3px solid ${e.color}`,
                    borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)",
                    marginBottom:"var(--s2)",
                    display:"flex", justifyContent:"space-between", alignItems:"center"
                  }}>
                    <div>
                      <div style={{ fontWeight:600, color:"var(--t1)", fontSize:"var(--sm)" }}>
                        {EVENT_TYPES[e.type].icon} {e.title}
                      </div>
                      {e.time && <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{e.time}</div>}
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(e.id)}>✕</button>
                  </div>
                ))
              }
            </>
          ) : (
            <div style={{ color:"var(--t3)", fontSize:"var(--sm)", textAlign:"center",
              padding:"var(--s10)" }}>
              Click a day to view or add events
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
