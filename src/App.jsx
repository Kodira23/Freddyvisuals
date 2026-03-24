import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Services from './pages/Services';
import Album from './pages/Album';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import './App.css';

function Layout() {
  const loc = useLocation();
  const isAdmin = loc.pathname === '/admin';
  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/"       element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/services" element={<Services />} />
        <Route path="/album"   element={<Album />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin"   element={<Admin />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
