import React, { useState } from "react";
import { PRODUCTS } from "./products";

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState([]);
  const [modelText, setModelText] = useState("");
  const [error, setError] = useState(null);

  const handleRecommend = async () => {
    setLoading(true);
    setError(null);
    setModelText("");
    setRecommendedIds([]);

    try {
      const resp = await fetch(
        "https://product-recommender-peach.vercel.app/recommend",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: query, products: PRODUCTS }),
        }
      );
      if (!resp.ok) throw new Error(`Server error ${resp.status}`);
      const data = await resp.json();
      // data = { recommendedIds: [...], modelText: '...' }
      setRecommendedIds(
        Array.isArray(data.recommendedIds) ? data.recommendedIds : []
      );
      setModelText(data.modelText || "");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const recommendedProducts = PRODUCTS.filter((p) =>
    recommendedIds.includes(p.id)
  );

  return (
    <div className="container">
      <h1>Product Recommender</h1>

      <div className="panel">
        <label htmlFor="pref">Enter preferences:</label>
        <input
          id="pref"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. I want a phone under $500"
        />
        <div className="actions">
          <button onClick={handleRecommend} disabled={loading || !query.trim()}>
            {loading ? "Thinking..." : "Recommend"}
          </button>
          <button
            onClick={() => {
              setQuery("");
              setRecommendedIds([]);
              setModelText("");
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>All products</h2>
        <ul className="product-list">
          {PRODUCTS.map((p) => (
            <li key={p.id} className="product-item">
              <strong>{p.name}</strong> — ${p.price} <em>({p.category})</em>
              <div className="features">{p.features.join(", ")}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h2>AI Recommendations</h2>
        {error && <div className="error">Error: {error}</div>}
        {modelText && (
          <div className="model-result">
            <h3>Model raw output</h3>
            <pre>{modelText}</pre>
          </div>
        )}

        <h3>Recommended products</h3>
        {recommendedProducts.length === 0 ? (
          <div>No recommendations yet.</div>
        ) : (
          <ul className="product-list">
            {recommendedProducts.map((p) => (
              <li key={p.id} className="product-item recommended">
                <strong>{p.name}</strong> — ${p.price} <em>({p.category})</em>
                <div className="features">{p.features.join(", ")}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer style={{ marginTop: 20 }}>
        <small>
          Server should be running at http://localhost:3000 (see README)
        </small>
      </footer>
    </div>
  );
}
