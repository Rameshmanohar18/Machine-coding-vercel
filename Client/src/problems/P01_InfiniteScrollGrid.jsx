/**
 * PROBLEM 1 — Infinite Scroll Photo Grid
 * ─────────────────────────────────────────────────────────────
 * Asked at: Meta, Google, Flipkart
 *
 * Requirements:
 * - Fetch photos in pages of 12
 * - Show a responsive grid
 * - Load more when user scrolls to bottom (IntersectionObserver)
 * - Show skeleton loaders while fetching
 * - Handle errors gracefully
 * - No duplicate fetches (loading guard)
 */

import { useState, useEffect, useRef, useCallback } from "react";

function SkeletonCard() {
  return (
    <div style={{
      borderRadius: "var(--r2)", overflow: "hidden",
      background: "var(--glass2)", border: "1px solid var(--gb)",
      animation: "pulse 1.4s ease infinite"
    }}>
      <div style={{ height: 160, background: "var(--glass2)" }} />
      <div style={{ padding: "var(--s3)" }}>
        <div style={{ height: 12, background: "var(--gb2)", borderRadius: 4, marginBottom: 6, width: "80%" }} />
        <div style={{ height: 10, background: "var(--gb)",  borderRadius: 4, width: "50%" }} />
      </div>
    </div>
  );
}

export default function InfiniteScrollGrid() {
  const [photos,  setPhotos]  = useState([]);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const fetchPhotos = useCallback(async (pageNum) => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`https://picsum.photos/v2/list?page=${pageNum}&limit=12`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.length < 12) setHasMore(false);
      setPhotos(prev => [...prev, ...data]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  // Initial load
  useEffect(() => { fetchPhotos(1); }, []);

  // IntersectionObserver — trigger next page
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !loading && hasMore) setPage(p => p + 1); },
      { threshold: 0.5 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  // Fetch when page increments
  useEffect(() => { if (page > 1) fetchPhotos(page); }, [page]);

  return (
    <div className="card">
      <h2 className="card-title">📸 Infinite Scroll Photo Grid</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at Meta, Google, Flipkart.</strong> IntersectionObserver-based infinite scroll
        with skeleton loaders, error handling, and duplicate-fetch prevention.
      </p>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "var(--s3)", marginBottom: "var(--s4)"
      }}>
        {photos.map(photo => (
          <div key={photo.id} style={{
            borderRadius: "var(--r2)", overflow: "hidden",
            border: "1px solid var(--gb)", transition: "transform var(--tr)",
            cursor: "pointer"
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <img
              src={`https://picsum.photos/id/${photo.id}/300/200`}
              alt={photo.author}
              loading="lazy"
              style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
            />
            <div style={{ padding: "var(--s2) var(--s3)" }}>
              <div style={{ fontSize: "var(--xs)", fontWeight: 600, color: "var(--t1)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {photo.author}
              </div>
              <div style={{ fontSize: "var(--xs)", color: "var(--t3)" }}>
                {photo.width}×{photo.height}
              </div>
            </div>
          </div>
        ))}

        {/* Skeleton loaders */}
        {loading && [...Array(6)].map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "var(--err-bg)", border: "1px solid rgba(239,68,68,.3)",
          borderRadius: "var(--r2)", padding: "var(--s4)", color: "var(--err)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button className="btn btn-danger btn-sm" onClick={() => fetchPhotos(page)}>Retry</button>
        </div>
      )}

      {/* Sentinel */}
      <div ref={loaderRef} style={{ height: 20 }} />

      {!hasMore && (
        <div style={{ textAlign: "center", color: "var(--t3)", fontSize: "var(--sm)", padding: "var(--s4)" }}>
          ✅ All {photos.length} photos loaded
        </div>
      )}
    </div>
  );
}
