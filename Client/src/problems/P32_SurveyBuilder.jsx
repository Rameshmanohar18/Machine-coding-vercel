/**
 * PROBLEM 32 — Survey / Quiz Builder
 * Asked at: Zoho, SurveyMonkey, Typeform, Freshworks
 *
 * Requirements:
 * - Add questions: multiple choice, checkbox, text, rating, dropdown, yes/no
 * - Drag to reorder questions
 * - Required field toggle
 * - Preview mode (take the survey)
 * - Results / analytics view
 * - Conditional logic (show Q3 only if Q1 = "Yes")
 * - Progress bar in preview
 * - Export results as JSON
 */

import { useState, useRef } from "react";

const Q_TYPES = {
  multiple: { label:"Multiple Choice", icon:"🔘" },
  checkbox: { label:"Checkboxes",      icon:"☑️" },
  text:     { label:"Short Text",      icon:"✏️" },
  rating:   { label:"Star Rating",     icon:"⭐" },
  dropdown: { label:"Dropdown",        icon:"▼"  },
  yesno:    { label:"Yes / No",        icon:"✅" },
};

let qId = 1;
const mkQ = (type) => ({
  id: qId++, type, required:false,
  text: `Question ${qId-1}`,
  options: ["multiple","checkbox","dropdown"].includes(type) ? ["Option A","Option B","Option C"] : [],
});

const INIT_QS = [
  { ...mkQ("multiple"), text:"How did you hear about us?", options:["Social Media","Friend","Google","Ad"] },
  { ...mkQ("rating"),   text:"How would you rate our service?" },
  { ...mkQ("text"),     text:"What can we improve?", required:true },
  { ...mkQ("yesno"),    text:"Would you recommend us to a friend?" },
];

export default function SurveyBuilder() {
  const [questions, setQuestions] = useState(INIT_QS);
  const [mode,      setMode]      = useState("build"); // build | preview | results
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState([]);
  const [previewQ,  setPreviewQ]  = useState(0);
  const [editing,   setEditing]   = useState(null);
  const dragIdx = useRef(null);

  const addQuestion = (type) => {
    setQuestions(q => [...q, mkQ(type)]);
  };

  const removeQ = (id) => setQuestions(q => q.filter(x => x.id!==id));

  const updateQ = (id, key, val) => {
    setQuestions(q => q.map(x => x.id===id ? { ...x, [key]:val } : x));
  };

  const updateOption = (qId, idx, val) => {
    setQuestions(q => q.map(x => x.id===qId
      ? { ...x, options:x.options.map((o,i) => i===idx ? val : o) }
      : x
    ));
  };

  const addOption = (qId) => {
    setQuestions(q => q.map(x => x.id===qId
      ? { ...x, options:[...x.options, `Option ${x.options.length+1}`] }
      : x
    ));
  };

  const onDragStart = (idx) => { dragIdx.current = idx; };
  const onDrop = (idx) => {
    if (dragIdx.current===null || dragIdx.current===idx) return;
    setQuestions(q => {
      const arr = [...q];
      const [moved] = arr.splice(dragIdx.current, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });
    dragIdx.current = null;
  };

  const setAnswer = (qId, val) => setAnswers(a => ({ ...a, [qId]:val }));

  const toggleCheckbox = (qId, opt) => {
    setAnswers(a => {
      const cur = a[qId] || [];
      return { ...a, [qId]: cur.includes(opt) ? cur.filter(x=>x!==opt) : [...cur, opt] };
    });
  };

  const submitSurvey = () => {
    const missing = questions.filter(q => q.required && !answers[q.id]);
    if (missing.length) { alert(`Please answer required questions: ${missing.map(q=>q.text).join(", ")}`); return; }
    setResponses(r => [...r, { ...answers, submittedAt:new Date().toLocaleTimeString() }]);
    setSubmitted(true);
  };

  const exportResults = () => {
    const blob = new Blob([JSON.stringify(responses, null, 2)], { type:"application/json" });
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="survey_results.json"; a.click();
  };

  const progress = questions.length ? (Object.keys(answers).length / questions.length) * 100 : 0;

  return (
    <div className="card">
      <h2 className="card-title">📋 Survey Builder</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Zoho, Freshworks, Typeform.</strong> Build surveys with 6 question types,
        drag to reorder, required toggle, preview mode with progress, results analytics.
      </p>

      {/* Mode tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--gb)", marginBottom:"var(--s5)" }}>
        {[["build","🏗 Build"],["preview","👁 Preview"],["results",`📊 Results (${responses.length})`]].map(([m,l]) => (
          <button key={m} onClick={() => { setMode(m); setSubmitted(false); setAnswers({}); setPreviewQ(0); }}
            style={{ padding:"8px 16px", background:"none", border:"none", cursor:"pointer",
              fontFamily:"var(--font)", fontSize:"var(--sm)", fontWeight:mode===m?700:400,
              color:mode===m?"var(--a2)":"var(--t3)",
              borderBottom:mode===m?"2px solid var(--a2)":"2px solid transparent",
              marginBottom:-1, transition:"all var(--tr)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* BUILD MODE */}
      {mode === "build" && (
        <div>
          {/* Add question buttons */}
          <div style={{ display:"flex", gap:"var(--s2)", flexWrap:"wrap", marginBottom:"var(--s5)" }}>
            {Object.entries(Q_TYPES).map(([type, meta]) => (
              <button key={type} className="btn btn-ghost btn-sm" onClick={() => addQuestion(type)}>
                {meta.icon} {meta.label}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div style={{ display:"flex", flexDirection:"column", gap:"var(--s3)" }}>
            {questions.map((q, idx) => (
              <div key={q.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(idx)}
                style={{ background:"var(--glass2)", border:`1px solid ${editing===q.id?"var(--a)":"var(--gb)"}`,
                  borderRadius:"var(--r2)", padding:"var(--s4)", cursor:"grab" }}>
                <div style={{ display:"flex", gap:"var(--s3)", alignItems:"flex-start" }}>
                  <span style={{ color:"var(--t3)", fontSize:"var(--sm)", marginTop:2 }}>⠿</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:"var(--s2)", alignItems:"center", marginBottom:"var(--s2)" }}>
                      <span style={{ fontSize:16 }}>{Q_TYPES[q.type].icon}</span>
                      <input
                        style={{ flex:1, background:"transparent", border:"none", outline:"none",
                          color:"var(--t1)", fontWeight:700, fontSize:"var(--sm)", fontFamily:"var(--font)" }}
                        value={q.text}
                        onChange={e => updateQ(q.id,"text",e.target.value)}
                        onFocus={() => setEditing(q.id)}
                        onBlur={() => setEditing(null)}
                      />
                      <label style={{ display:"flex", alignItems:"center", gap:"var(--s1)",
                        fontSize:"var(--xs)", color:"var(--t2)", cursor:"pointer" }}>
                        <input type="checkbox" checked={q.required}
                          onChange={e => updateQ(q.id,"required",e.target.checked)}
                          style={{ accentColor:"var(--err)" }} />
                        Required
                      </label>
                      <button className="btn btn-danger btn-sm" onClick={() => removeQ(q.id)}>✕</button>
                    </div>

                    {/* Options editor */}
                    {q.options.length > 0 && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"var(--s1)", marginLeft:"var(--s4)" }}>
                        {q.options.map((opt, i) => (
                          <div key={i} style={{ display:"flex", gap:"var(--s2)", alignItems:"center" }}>
                            <span style={{ color:"var(--t3)", fontSize:12 }}>○</span>
                            <input
                              style={{ flex:1, background:"var(--glass)", border:"1px solid var(--gb)",
                                borderRadius:"var(--r1)", padding:"4px 8px", color:"var(--t1)",
                                fontSize:"var(--sm)", outline:"none", fontFamily:"var(--font)" }}
                              value={opt}
                              onChange={e => updateOption(q.id, i, e.target.value)}
                            />
                          </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" style={{ alignSelf:"flex-start" }}
                          onClick={() => addOption(q.id)}>+ Add option</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PREVIEW MODE */}
      {mode === "preview" && !submitted && (
        <div style={{ maxWidth:560 }}>
          {/* Progress */}
          <div style={{ marginBottom:"var(--s5)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--xs)",
              color:"var(--t2)", marginBottom:"var(--s2)" }}>
              <span>Question {previewQ+1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div style={{ height:4, background:"var(--gb)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progress}%`, background:"var(--a2)",
                borderRadius:2, transition:"width .3s ease" }} />
            </div>
          </div>

          {questions[previewQ] && (() => {
            const q = questions[previewQ];
            return (
              <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r3)", padding:"var(--s6)" }}>
                <h3 style={{ marginBottom:"var(--s5)" }}>
                  {q.text}
                  {q.required && <span style={{ color:"var(--err)", marginLeft:"var(--s1)" }}>*</span>}
                </h3>

                {q.type === "multiple" && q.options.map(opt => (
                  <label key={opt} style={{ display:"flex", alignItems:"center", gap:"var(--s3)",
                    padding:"var(--s3)", borderRadius:"var(--r2)", cursor:"pointer", marginBottom:"var(--s2)",
                    background:answers[q.id]===opt?"var(--abg)":"var(--glass)",
                    border:`1px solid ${answers[q.id]===opt?"var(--a)":"var(--gb)"}`,
                    transition:"all var(--tr)" }}>
                    <input type="radio" name={`q${q.id}`} checked={answers[q.id]===opt}
                      onChange={() => setAnswer(q.id, opt)} style={{ accentColor:"var(--a2)" }} />
                    <span style={{ color:"var(--t1)" }}>{opt}</span>
                  </label>
                ))}

                {q.type === "checkbox" && q.options.map(opt => (
                  <label key={opt} style={{ display:"flex", alignItems:"center", gap:"var(--s3)",
                    padding:"var(--s3)", borderRadius:"var(--r2)", cursor:"pointer", marginBottom:"var(--s2)",
                    background:(answers[q.id]||[]).includes(opt)?"var(--abg)":"var(--glass)",
                    border:`1px solid ${(answers[q.id]||[]).includes(opt)?"var(--a)":"var(--gb)"}`,
                    transition:"all var(--tr)" }}>
                    <input type="checkbox" checked={(answers[q.id]||[]).includes(opt)}
                      onChange={() => toggleCheckbox(q.id, opt)} style={{ accentColor:"var(--a2)" }} />
                    <span style={{ color:"var(--t1)" }}>{opt}</span>
                  </label>
                ))}

                {q.type === "text" && (
                  <textarea className="textarea" style={{ minHeight:80 }}
                    placeholder="Your answer..."
                    value={answers[q.id]||""}
                    onChange={e => setAnswer(q.id, e.target.value)} />
                )}

                {q.type === "rating" && (
                  <div style={{ display:"flex", gap:"var(--s2)" }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setAnswer(q.id, s)}
                        style={{ background:"none", border:"none", cursor:"pointer",
                          fontSize:32, color:s<=(answers[q.id]||0)?"#f59e0b":"var(--t3)",
                          transition:"color var(--tr)" }}>
                        ★
                      </button>
                    ))}
                  </div>
                )}

                {q.type === "dropdown" && (
                  <select className="select" value={answers[q.id]||""}
                    onChange={e => setAnswer(q.id, e.target.value)}>
                    <option value="">Select an option...</option>
                    {q.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                )}

                {q.type === "yesno" && (
                  <div style={{ display:"flex", gap:"var(--s3)" }}>
                    {["Yes","No"].map(v => (
                      <button key={v}
                        className={`btn ${answers[q.id]===v?"btn-primary":"btn-ghost"}`}
                        style={{ flex:1 }}
                        onClick={() => setAnswer(q.id, v)}>
                        {v==="Yes"?"✅ Yes":"❌ No"}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display:"flex", gap:"var(--s3)", marginTop:"var(--s5)" }}>
                  {previewQ > 0 && (
                    <button className="btn btn-ghost" onClick={() => setPreviewQ(p=>p-1)}>← Back</button>
                  )}
                  {previewQ < questions.length-1
                    ? <button className="btn btn-primary" style={{ flex:1 }}
                        onClick={() => setPreviewQ(p=>p+1)}>Next →</button>
                    : <button className="btn btn-success" style={{ flex:1 }} onClick={submitSurvey}>
                        Submit Survey ✓
                      </button>
                  }
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {mode === "preview" && submitted && (
        <div style={{ textAlign:"center", padding:"var(--s10)" }}>
          <div style={{ fontSize:64, marginBottom:"var(--s4)" }}>🎉</div>
          <h2 style={{ color:"var(--ok)", marginBottom:"var(--s3)" }}>Thank you!</h2>
          <p>Your response has been recorded.</p>
          <button className="btn btn-primary" style={{ marginTop:"var(--s5)" }}
            onClick={() => { setSubmitted(false); setAnswers({}); setPreviewQ(0); }}>
            Take Again
          </button>
        </div>
      )}

      {/* RESULTS MODE */}
      {mode === "results" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"var(--s5)" }}>
            <div style={{ fontSize:"var(--xl)", fontWeight:800, color:"var(--a2)" }}>
              {responses.length} responses
            </div>
            <button className="btn btn-ghost btn-sm" onClick={exportResults}>⬇ Export JSON</button>
          </div>

          {responses.length === 0 ? (
            <div style={{ textAlign:"center", color:"var(--t3)", padding:"var(--s10)" }}>
              No responses yet. Switch to Preview and submit the survey.
            </div>
          ) : (
            questions.map(q => {
              const qAnswers = responses.map(r => r[q.id]).filter(Boolean);
              return (
                <div key={q.id} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                  borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s3)" }}>
                  <div style={{ fontWeight:700, color:"var(--t1)", marginBottom:"var(--s3)" }}>
                    {Q_TYPES[q.type].icon} {q.text}
                  </div>
                  {q.type === "text" ? (
                    qAnswers.map((a,i) => (
                      <div key={i} style={{ background:"var(--glass)", border:"1px solid var(--gb)",
                        borderRadius:"var(--r1)", padding:"var(--s2) var(--s3)", marginBottom:"var(--s1)",
                        fontSize:"var(--sm)", color:"var(--t1)" }}>"{a}"</div>
                    ))
                  ) : q.type === "rating" ? (
                    <div style={{ fontSize:"var(--lg)", color:"#f59e0b" }}>
                      Avg: {"★".repeat(Math.round(qAnswers.reduce((s,a)=>s+a,0)/qAnswers.length))}
                      {" "}({(qAnswers.reduce((s,a)=>s+a,0)/qAnswers.length).toFixed(1)}/5)
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)" }}>
                      {[...new Set(qAnswers.flat())].map(opt => {
                        const count = qAnswers.flat().filter(a=>a===opt).length;
                        const pct   = (count/responses.length)*100;
                        return (
                          <div key={opt}>
                            <div style={{ display:"flex", justifyContent:"space-between",
                              fontSize:"var(--sm)", marginBottom:"var(--s1)" }}>
                              <span style={{ color:"var(--t1)" }}>{opt}</span>
                              <span style={{ color:"var(--a2)", fontWeight:700 }}>{count} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div style={{ height:6, background:"var(--gb)", borderRadius:3, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${pct}%`, background:"var(--a2)",
                                borderRadius:3, transition:"width .4s ease" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
