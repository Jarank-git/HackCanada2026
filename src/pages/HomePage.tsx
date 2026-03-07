import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="home-page">
      {/* ── Hero ──────────────────────────────── */}
      <div className="hero-banner">
        <section className="hero">
          <span className="hero-paw-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <ellipse cx="6.5" cy="5" rx="2" ry="2.5" />
              <ellipse cx="17.5" cy="5" rx="2" ry="2.5" />
              <ellipse cx="3.5" cy="11" rx="1.8" ry="2.2" />
              <ellipse cx="20.5" cy="11" rx="1.8" ry="2.2" />
              <ellipse cx="12" cy="15.5" rx="4.5" ry="4" />
            </svg>
            Pet Adoption Campaigns
          </span>
          <h1>
            Every shelter pet deserves a{' '}
            <span className="text-gold">great first impression</span>
          </h1>
          <p className="hero-subtitle">
            Turn shelter photos into polished, shareable adoption campaigns —
            optimized for every social platform, ready in minutes.
          </p>
          <div className="hero-actions">
            <Link to="/upload" className="btn btn-primary btn-lg">
              Start a Campaign
            </Link>
            <Link to="/gallery" className="btn btn-white btn-lg">
              Browse Pets
            </Link>
          </div>
        </section>
      </div>

      {/* ── Stats ─────────────────────────────── */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <span className="stat-number">5+</span>
            <span className="stat-label">Platforms Supported</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">&lt;2 min</span>
            <span className="stat-label">To Create a Campaign</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Free &amp; Open Source</span>
          </div>
        </div>
      </div>

      {/* ── Features ──────────────────────────── */}
      <section className="features-section">
        <div className="features-inner">
          <div className="features-header">
            <div className="section-label">What PawPrint Does</div>
            <h2>Built for shelter volunteers</h2>
            <p>
              No design skills needed. Upload photos, fill in details,
              and let PawPrint handle the rest.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon--gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <h3>Smart photo optimization</h3>
              <p>
                Auto-crop, enhance, and resize shelter photos for every major
                social platform with a single upload.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--coral">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3>AI-written captions</h3>
              <p>
                Generate warm, adoption-ready captions that highlight
                each pet's personality and charm.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <h3>One-click download packs</h3>
              <p>
                Get a ZIP with platform-sized images, captions, QR code, and a
                shareable profile link — ready to post.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────── */}
      <section className="steps-section">
        <div className="section-label">How It Works</div>
        <h2>Three steps to a shareable campaign</h2>
        <p className="steps-subtitle">
          From shelter kennel to social feed in under two minutes.
        </p>
        <ol className="steps-list">
          <li className="step-item">
            <div className="step-number">1</div>
            <h3>Upload photos</h3>
            <p>
              Drag in shelter photos. We'll pick the best one as the
              hero and optimize the rest automatically.
            </p>
          </li>
          <li className="step-item">
            <div className="step-number">2</div>
            <h3>Add pet details</h3>
            <p>
              Name, breed, age, temperament — the basics that help adopters
              fall in love.
            </p>
          </li>
          <li className="step-item">
            <div className="step-number">3</div>
            <h3>Share everywhere</h3>
            <p>
              Download optimized assets for Instagram, Facebook, and
              Twitter, or share the profile link directly.
            </p>
          </li>
        </ol>
      </section>

      {/* ── Bottom CTA ────────────────────────── */}
      <section className="cta-section">
        <div className="cta-banner">
          <div>
            <h2>Ready to find them a home?</h2>
            <p>Start your first campaign in under two minutes.</p>
          </div>
          <Link to="/upload" className="btn btn-primary btn-lg">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
