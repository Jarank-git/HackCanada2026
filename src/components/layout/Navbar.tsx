import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <ellipse cx="6.5" cy="5" rx="2.2" ry="2.8" fill="#fdb924" />
            <ellipse cx="17.5" cy="5" rx="2.2" ry="2.8" fill="#fdb924" />
            <ellipse cx="3.5" cy="11" rx="2" ry="2.5" fill="#fdb924" />
            <ellipse cx="20.5" cy="11" rx="2" ry="2.5" fill="#fdb924" />
            <ellipse cx="12" cy="16" rx="5" ry="4.5" fill="#fdb924" />
          </svg>
          PawPrint
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end className="nav-link">
            Home
          </NavLink>
          <NavLink to="/upload" className="nav-link">
            Upload
          </NavLink>
          <NavLink to="/gallery" className="nav-link">
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
