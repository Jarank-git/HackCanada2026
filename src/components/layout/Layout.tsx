import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import OfflineBanner from '../ui/OfflineBanner';
import PageTransition from '../ui/PageTransition';

export default function Layout() {
  return (
    <div className="layout">
      <OfflineBanner />
      <Navbar />
      <main className="layout-main">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
