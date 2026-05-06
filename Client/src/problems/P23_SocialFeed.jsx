/**
 * PROBLEM 23 — Social Media Feed (Twitter/LinkedIn clone)
 * Asked at: Sprinklr, Freshworks, Meta
 *
 * Requirements:
 * - Post feed with like/comment/share/bookmark
 * - Create post with text + emoji picker
 * - Optimistic UI updates (like instantly, revert on error)
 * - Infinite scroll (load more)
 * - Filter: All / Following / Trending
 * - User mentions (@) and hashtags (#) highlighted
 * - Relative timestamps
 * - Retweet/repost count
 */

import { useState, useCallback } from "react";

const USERS = [
  { id:1, name:"Priya Sharma",   handle:"@priya_dev",   avatar:"👩‍💻" },
  { id:2, name:"Rahul Gupta",    handle:"@rahul_codes",  avatar:"👨‍💻" },
  { id:3, name:"Ananya Singh",   handle:"@ananya_ux",    avatar:"👩‍🎨" },
  { id:4, name:"Karthik Rajan",  handle:"@karthik_ml",   avatar:"🧑‍🔬" },
  { id:5, name:"Divya Nair",     handle:"@divya_pm",     avatar:"👩‍💼" },
];

let postId = 100;

const INITIAL_POSTS = [
  { id:postId++, userId:1, text:"Just shipped a new feature using #React and #TypeScript! The compound component pattern is 🔥 cc @rahul_codes", likes:42, comments:8,  shares:12, bookmarked:false, liked:false, time: Date.now()-300000  },
  { id:postId++, userId:2, text:"Hot take: #useMemo is overused. Profile first, optimize later. Most re-renders are fast enough. #ReactJS #performance", likes:128, comments:34, shares:56, bookmarked:true,  liked:true,  time: Date.now()-900000  },
  { id:postId++, userId:3, text:"Design tip: White space is not wasted space. It's breathing room for your users. #UX #design #frontend", likes:89,  comments:15, shares:23, bookmarked:false, liked:false, time: Date.now()-1800000 },
  { id:postId++, userId:4, text:"Trained a model on 1M records in under 2 minutes using #PyTorch on GPU. The future is now! #MachineLearning #AI", likes:203, comments:47, shares:89, bookmarked:false, liked:false, time: Date.now()-3600000 },
  { id:postId++, userId:5, text:"Product lesson: Talk to 10 users before writing a single line of code. You'll save weeks of rework. #ProductManagement", likes:156, comments:28, shares:67, bookmarked:true,  liked:false, time: Date.now()-7200000 },
];

function timeAgo(ts) {
  const d = (Date.now()-ts)/1000;
  if (d < 60)   return `${Math.floor(d)}s`;
  if (d < 3600) return `${Math.floor(d/60)}m`;
  if (d < 86400)return `${Math.floor(d/3600)}h`;
  return `${Math.floor(d/86400)}d`;
}

function formatText(text) {
  return text.split(/(\s+)/).map((word, i) => {
    if (word.startsWith("#")) return <span key={i} style={{ color:"var(--a2)", fontWeight:600 }}>{word}</span>;
    if (word.startsWith("@")) return <span key={i} style={{ color:"var(--info)", fontWeight:600 }}>{word}</span>;
    return word;
  });
}

const EMOJIS = ["😀","🔥","💡","🚀","❤️","👍","🎉","💻","⚡","🌟"];

export default function SocialFeed() {
  const [posts,    setPosts]    = useState(INITIAL_POSTS);
  const [newPost,  setNewPost]  = useState("");
  const [filter,   setFilter]   = useState("all");
  const [showEmoji, setShowEmoji] = useState(false);
  const [page,     setPage]     = useState(1);

  const user = USERS[0]; // current user

  const createPost = () => {
    if (!newPost.trim()) return;
    setPosts(p => [{
      id: postId++, userId:1, text:newPost, likes:0, comments:0,
      shares:0, bookmarked:false, liked:false, time:Date.now()
    }, ...p]);
    setNewPost("");
  };

  const toggleLike = useCallback((id) => {
    setPosts(prev => prev.map(p => p.id===id
      ? { ...p, liked:!p.liked, likes:p.liked ? p.likes-1 : p.likes+1 }
      : p
    ));
  }, []);

  const toggleBookmark = useCallback((id) => {
    setPosts(prev => prev.map(p => p.id===id ? { ...p, bookmarked:!p.bookmarked } : p));
  }, []);

  const filtered = posts.filter(p => {
    if (filter === "trending")  return p.likes > 50;
    if (filter === "following") return [1,2,3].includes(p.userId);
    return true;
  });

  const visible = filtered.slice(0, page * 5);

  return (
    <div className="card">
      <h2 className="card-title">📱 Social Media Feed</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Sprinklr, Freshworks, Meta.</strong> Post feed with like/comment/share/bookmark,
        create post with emoji picker, optimistic UI, filter tabs, hashtag/mention highlighting.
      </p>

      {/* Create post */}
      <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
        borderRadius:"var(--r3)", padding:"var(--s4)", marginBottom:"var(--s5)" }}>
        <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s3)" }}>
          <span style={{ fontSize:32 }}>{user.avatar}</span>
          <textarea className="textarea" style={{ minHeight:80, flex:1 }}
            placeholder="What's on your mind? Use #hashtags and @mentions"
            value={newPost} onChange={e => setNewPost(e.target.value)} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowEmoji(s => !s)}>😊 Emoji</button>
            {showEmoji && (
              <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:10,
                background:"rgba(13,16,37,.97)", border:"1px solid var(--gb2)",
                borderRadius:"var(--r2)", padding:"var(--s2)", display:"flex", flexWrap:"wrap",
                gap:"var(--s1)", width:200 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => { setNewPost(n => n+e); setShowEmoji(false); }}
                    style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, padding:4 }}>
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display:"flex", gap:"var(--s2)", alignItems:"center" }}>
            <span style={{ fontSize:"var(--xs)", color: newPost.length>280?"var(--err)":"var(--t3)" }}>
              {280-newPost.length}
            </span>
            <button className="btn btn-primary btn-sm" onClick={createPost}
              disabled={!newPost.trim() || newPost.length>280}>
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--gb)", marginBottom:"var(--s4)" }}>
        {["all","following","trending"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:"8px 16px", background:"none", border:"none", cursor:"pointer",
              fontFamily:"var(--font)", fontSize:"var(--sm)", fontWeight:filter===f?700:400,
              color:filter===f?"var(--a2)":"var(--t3)",
              borderBottom:filter===f?"2px solid var(--a2)":"2px solid transparent",
              marginBottom:-1, transition:"all var(--tr)", textTransform:"capitalize" }}>
            {f === "all" ? "🌐 All" : f === "following" ? "👥 Following" : "🔥 Trending"}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div style={{ display:"flex", flexDirection:"column", gap:"var(--s3)" }}>
        {visible.map(post => {
          const author = USERS.find(u => u.id===post.userId);
          return (
            <div key={post.id} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r3)", padding:"var(--s4)", transition:"border-color var(--tr)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="var(--gb2)"}
              onMouseLeave={e => e.currentTarget.style.borderColor="var(--gb)"}>
              {/* Header */}
              <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s3)" }}>
                <span style={{ fontSize:32 }}>{author.avatar}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <div>
                      <span style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{author.name}</span>
                      <span style={{ color:"var(--t3)", fontSize:"var(--xs)", marginLeft:"var(--s2)" }}>{author.handle}</span>
                    </div>
                    <span style={{ color:"var(--t3)", fontSize:"var(--xs)" }}>{timeAgo(post.time)}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <p style={{ color:"var(--t1)", lineHeight:1.6, marginBottom:"var(--s4)", fontSize:"var(--base)" }}>
                {formatText(post.text)}
              </p>

              {/* Actions */}
              <div style={{ display:"flex", gap:"var(--s4)", borderTop:"1px solid var(--gb)", paddingTop:"var(--s3)" }}>
                {[
                  { icon: post.liked?"❤️":"🤍", count:post.likes,    action:() => toggleLike(post.id),     color:post.liked?"var(--err)":undefined },
                  { icon:"💬",                   count:post.comments, action:() => {},                       color:undefined },
                  { icon:"🔁",                   count:post.shares,   action:() => {},                       color:undefined },
                  { icon: post.bookmarked?"🔖":"📌", count:null,      action:() => toggleBookmark(post.id), color:post.bookmarked?"var(--warn)":undefined },
                ].map((a, i) => (
                  <button key={i} onClick={a.action}
                    style={{ background:"none", border:"none", cursor:"pointer", display:"flex",
                      alignItems:"center", gap:"var(--s1)", color:a.color||"var(--t3)",
                      fontSize:"var(--sm)", transition:"color var(--tr)" }}>
                    <span>{a.icon}</span>
                    {a.count !== null && <span style={{ fontWeight:600 }}>{a.count}</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {visible.length < filtered.length && (
        <button className="btn btn-ghost" style={{ width:"100%", marginTop:"var(--s4)" }}
          onClick={() => setPage(p => p+1)}>
          Load more posts
        </button>
      )}
    </div>
  );
}
