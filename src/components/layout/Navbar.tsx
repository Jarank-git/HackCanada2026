import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src="/pawprint-logo.png" alt="" width="30" height="30" aria-hidden="true" className="navbar-logo" />
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
