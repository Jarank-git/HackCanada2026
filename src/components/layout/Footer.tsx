import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">PawPrint</div>
          <p className="footer-tagline">
            Helping shelter pets find their forever homes.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/upload" className="footer-link">Upload</Link>
          <Link to="/gallery" className="footer-link">Gallery</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>HackCanada 2025</span>
        <span>Powered by Cloudinary</span>
      </div>
    </footer>
  );
}
