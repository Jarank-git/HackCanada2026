import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <ellipse cx="6.5" cy="5" rx="2.2" ry="2.8" fill="#fdb924" />
            <ellipse cx="17.5" cy="5" rx="2.2" ry="2.8" fill="#fdb924" />
            <ellipse cx="3.5" cy="11" rx="2" ry="2.5" fill="#fdb924" />
            <ellipse cx="20.5" cy="11" rx="2" ry="2.5" fill="#fdb924" />
            <ellipse cx="12" cy="16" rx="5" ry="4.5" fill="#fdb924" />
          </svg>
          PawPrint
        </Link>

        <button
          type="button"
          className={`navbar-toggle${menuOpen ? ' navbar-toggle--open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
        </button>

        <div className={`navbar-links${menuOpen ? ' navbar-links--open' : ''}`}>
          <NavLink to="/" end className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/upload" className="nav-link" onClick={() => setMenuOpen(false)}>
            Upload
          </NavLink>
          <NavLink to="/gallery" className="nav-link" onClick={() => setMenuOpen(false)}>
            Gallery
          </NavLink>
        </div>

        <div className="navbar-cta">
          <Link to="/upload" className="btn btn-primary">
            Create Campaign
          </Link>
        </div>
      </div>
    </nav>
  );
}
