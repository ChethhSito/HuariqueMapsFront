import { useState, useEffect } from 'react';
import heroImage from '../assets/peruvian_cuisine_hero.png';
import cevicheImage from '../assets/ceviche_carretilla.png';
import anticuchosImage from '../assets/anticuchos_lima.png';
import './LandingPage.css';
import LandingNavbar from './Landing/LandingNavbar';
import HeroSection from './Landing/HeroSection';
import ConceptSection from './Landing/ConceptSection';
import UsoSection from './Landing/UsoSection';
import RestaurantsSection from './Landing/RestaurantsSection';
import SuggestionsSection from './Landing/SuggestionsSection';
import Footer from './Landing/Footer';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'map') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  user: { nombre: string } | null;
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

  const popularRestaurants = [
    {
      id: 1,
      nombre: 'El Ceviche de Pedro',
      tipoComida: 'Marina',
      descripcion: 'Ceviche clásico de carretilla preparado al momento con pesca fresca del día, abundante limón piurano y choclo desgranado.',
      imagen: cevicheImage,
      horario: 'Mar - Dom: 11:00 AM - 4:30 PM',
      ubicacion: 'Chorrillos, Lima',
    },
    {
      id: 2,
      nombre: 'Anticuchos del Puente',
      tipoComida: 'Criolla',
      descripcion: 'Tradicionales brochetas de corazón a la parrilla marinados en ají panca y especias, acompañados de papas doradas y choclo tierno.',
      imagen: anticuchosImage,
      horario: 'Lun - Sáb: 6:00 PM - 11:30 PM',
      ubicacion: 'Barranco, Lima',
    },
    {
      id: 3,
      nombre: 'El Rinconcito Lomeño',
      tipoComida: 'Fusión / Criolla',
      descripcion: 'Especialistas en lomo saltado ahumado al wok con cebolla crujiente, tomates jugosos y papas nativas amarillas fritas al instante.',
      imagen: heroImage,
      horario: 'Lun - Dom: 12:00 PM - 10:00 PM',
      ubicacion: 'Centro de Lima',
    },
  ];

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

      {/* Patriotic Banner */}
      <section className="patriotic-banner">
        <div className="section-container">
          <h2 className="banner-title">La comida que nos une</h2>
          <p className="banner-desc">
            Desde un ceviche al paso en una carretilla hasta el lomo saltado más tradicional del centro histórico,
            cada huarique cuenta una historia de esfuerzo, unión y amor por nuestra tierra.
          </p>
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <UsoSection />

      <RestaurantsSection popularRestaurants={popularRestaurants} />

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
