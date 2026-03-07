import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import GalleryPage from './pages/GalleryPage';
import PetProfilePage from './pages/PetProfilePage';
import DownloadPage from './pages/DownloadPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/pet/:id" element={<PetProfilePage />} />
        <Route path="/pet/:id/download" element={<DownloadPage />} />
      </Route>
    </Routes>
  );
}

export default App;
