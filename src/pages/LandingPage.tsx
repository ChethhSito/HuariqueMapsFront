import { useState, useEffect } from 'react';
import heroImage from '../assets/peruvian_cuisine_hero.png';
import cevicheImage from '../assets/ceviche_carretilla.png';
import anticuchosImage from '../assets/anticuchos_lima.png';
import './LandingPage.css';
import LandingNavbar from '../components/Landing/LandingNavbar';
import HeroSection from '../components/Landing/HeroSection';
import ConceptSection from '../components/Landing/ConceptSection';
import UsoSection from '../components/Landing/UsoSection';
import RestaurantsSection from '../components/Landing/RestaurantsSection';
import SuggestionsSection from '../components/Landing/SuggestionsSection';
import Footer from '../components/Landing/Footer';
import { getHuariques } from '../api/huariques';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'map' | 'admin') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  user: any;
  onAuthClick: () => void;
  onLogout: () => void;
}

export default function LandingPage({ onNavigate, isDark, onToggleTheme, user, onAuthClick, onLogout }: LandingPageProps) {
  // Estados para el buzón de sugerencias
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = ['inicio', 'concepto', 'uso', 'restaurantes', 'sugerencias'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre && correo && descripcion) {
      console.log('Sugerencia enviada:', { nombre, correo, descripcion });
      setIsSubmitted(true);

      setTimeout(() => {
        setNombre('');
        setCorreo('');
        setDescripcion('');
        setIsSubmitted(false);
      }, 5000);
    }
  };

  const [popularHuariques, setPopularHuariques] = useState<any[]>([]);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const allHuariques = await getHuariques();
        // Filtrar huariques que estén aprobados y marcados como populares
        const filtered = allHuariques.filter(h => h.estado === 'APROBADO' && h.popular);
        
        if (filtered.length > 0) {
          const mapped = filtered.map(h => ({
            id: h._id,
            nombre: h.nombre,
            tipoComida: h.tipoComida,
            descripcion: h.descripcion || 'Una deliciosa experiencia gastronómica tradicional.',
            imagen: h.imagenUrl || (h.tipoComida.toLowerCase().includes('marin') ? cevicheImage : h.tipoComida.toLowerCase().includes('crioll') ? anticuchosImage : heroImage),
            horario: h.horario || 'Mar - Dom: 12:00 PM - 8:00 PM',
            ubicacion: h.distrito ? `${h.distrito.charAt(0) + h.distrito.slice(1).toLowerCase()}, Lima` : 'Lima, Perú'
          }));
          setPopularHuariques(mapped);
        } else {
          setPopularHuariques([]);
        }
      } catch (err) {
        console.warn('Error cargando huariques populares desde backend:', err);
        setPopularHuariques([]);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <LandingNavbar
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        user={user}
        onAuthClick={onAuthClick}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <HeroSection
        onNavigate={onNavigate}
        scrollToSection={scrollToSection}
      />

      <ConceptSection />



      {/* Popular Restaurants Section */}
      <UsoSection />

      <RestaurantsSection popularRestaurants={popularHuariques} />

      <SuggestionsSection 
        isSubmitted={isSubmitted}
        nombre={nombre}
        setNombre={setNombre}
        correo={correo}
        setCorreo={setCorreo}
        descripcion={descripcion}
        setDescripcion={setDescripcion}
        handleSuggestionSubmit={handleSuggestionSubmit}
      />

      <Footer scrollToSection={scrollToSection} />
    </div>
  );
}
