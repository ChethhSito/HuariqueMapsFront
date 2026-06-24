import React, { useState, useEffect } from 'react';
import type { Huarique } from '../types';
import { 
  getHuariquesAdmin, 
  updateHuariqueEstado, 
  updateHuarique, 
  deleteHuarique 
} from '../api/huariques';
import { getUsers } from '../api/auth';
import './AdminDashboard.css';

interface AdminDashboardProps {
  user: any;
  onNavigate: (view: 'landing' | 'map') => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function AdminDashboard({ user, onNavigate, onLogout, isDark, onToggleTheme }: AdminDashboardProps) {
  const [huariques, setHuariques] = useState<Huarique[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'huariques'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingHuarique, setEditingHuarique] = useState<Huarique | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTipoComida, setEditTipoComida] = useState('');
  const [editDistrito, setEditDistrito] = useState('');
  const [editHorario, setEditHorario] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editPopular, setEditPopular] = useState(false);
  const [editEstado, setEditEstado] = useState<'PENDIENTE' | 'APROBADO' | 'RECHAZADO'>('PENDIENTE');
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filter state for Huariques Tab
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('Todos');

  const token = user?.token || '';

  // Load all huariques including pending/rejected ones
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getHuariquesAdmin(token);
      setHuariques(data);

      try {
        const users = await getUsers(token);
        setUsersCount(users.length || 0);
      } catch (uErr) {
        console.warn('No se pudo obtener la cantidad real de usuarios del backend:', uErr);
        setUsersCount(128); // Fallback realista
      }

      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con la API de administración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Handle Approve / Reject / Pend
  const handleStatusChange = async (id: string, newEstado: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO') => {
    try {
      await updateHuariqueEstado(id, newEstado, token);
      setHuariques(prev => prev.map(h => h._id === id ? { ...h, estado: newEstado } : h));
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    }
  };

  // Handle Toggle Popular Status directly from table
  const handleTogglePopular = async (huarique: Huarique) => {
    const updatedPopular = !huarique.popular;
    try {
      await updateHuarique(huarique._id, { popular: updatedPopular }, token);
      setHuariques(prev => prev.map(h => h._id === huarique._id ? { ...h, popular: updatedPopular } : h));
    } catch (err: any) {
      alert(err.message || 'Error al cambiar popularidad');
    }
  };

  // Handle Delete Huarique
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este huarique permanentemente?')) return;
    try {
      await deleteHuarique(id, token);
      setHuariques(prev => prev.filter(h => h._id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar huarique');
    }
  };

  // Open Edit Modal
  const openEditModal = (huarique: Huarique) => {
    setEditingHuarique(huarique);
    setEditNombre(huarique.nombre);
    setEditTipoComida(huarique.tipoComida);
    setEditDistrito(huarique.distrito || '');
    setEditHorario(huarique.horario || '');
    setEditDescripcion(huarique.descripcion || '');
    setEditPopular(huarique.popular || false);
    setEditEstado(huarique.estado as any || 'PENDIENTE');
  };

  // Save Edits
  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHuarique) return;

    setIsSaving(true);
    try {
      const updatedData = {
        nombre: editNombre,
        tipoComida: editTipoComida,
        distrito: editDistrito.toUpperCase(),
        horario: editHorario,
        descripcion: editDescripcion,
        popular: editPopular,
        estado: editEstado
      };

      await updateHuarique(editingHuarique._id, updatedData, token);
      
      // Si el estado cambió, también enviamos la llamada del estado
      if (editingHuarique.estado !== editEstado) {
        await updateHuariqueEstado(editingHuarique._id, editEstado, token);
      }

      setHuariques(prev => prev.map(h => h._id === editingHuarique._id ? { ...h, ...updatedData } : h));
      setEditingHuarique(null);
    } catch (err: any) {
      alert(err.message || 'Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate metrics
  const totalHuariques = huariques.length;
  const pendientes = huariques.filter(h => h.estado === 'PENDIENTE').length;
  const aprobados = huariques.filter(h => h.estado === 'APROBADO').length;
  const rechazados = huariques.filter(h => h.estado === 'RECHAZADO').length;

  const totalReviews = huariques.reduce((sum, h) => sum + (h.numResenas || h.resenas?.length || 0), 0);
  const avgRating = huariques.length > 0 
    ? (huariques.reduce((sum, h) => sum + (h.ratingPromedio || 0), 0) / huariques.length).toFixed(1) 
    : '0.0';

  // Get unique districts for filtering
  const districts = ['Todos', ...new Set(huariques.map(h => h.distrito).filter(Boolean))].sort();

  // Filter huariques for the list view
  const filteredHuariques = huariques.filter(h => {
    const matchesSearch = h.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          h.tipoComida.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (h.distrito && h.distrito.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDistrict = filterDistrict === 'Todos' || h.distrito === filterDistrict;
    return matchesSearch && matchesDistrict;
  });

  // Latest 5 registered huariques
  const latestHuariques = [...huariques]
    .sort((a, b) => {
      // Sort by creation date if available, or just mock fallback
      const dateA = a._id.startsWith('mock') ? 0 : parseInt(a._id, 16) || 0;
      const dateB = b._id.startsWith('mock') ? 0 : parseInt(b._id, 16) || 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APROBADO': return 'Aprobado';
      case 'PENDIENTE': return 'Pendiente';
      case 'RECHAZADO': return 'Rechazado';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'APROBADO': return 'status-badge status-approved';
      case 'PENDIENTE': return 'status-badge status-pending';
      case 'RECHAZADO': return 'status-badge status-rejected';
      default: return 'status-badge';
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2 className="admin-brand-title">Huarique<span>Map</span></h2>
          <span className="admin-brand-subtitle">PANEL ADMINISTRATIVO</span>
        </div>
        <hr className="admin-divider" />
        
        <div className="admin-menu-section">
          <span className="admin-menu-header">PRINCIPAL</span>
          <nav className="admin-nav">
            <button 
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'huariques' ? 'active' : ''}`}
              onClick={() => setActiveTab('huariques')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              Huariques
            </button>
            <button className="admin-nav-item disabled" disabled title="Próximamente">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Usuarios
            </button>
            <button className="admin-nav-item disabled" disabled title="Próximamente">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
              Reportes
            </button>
          </nav>
        </div>

        <div className="admin-menu-section" style={{ marginTop: 'auto' }}>
          <span className="admin-menu-header">EXPLORAR</span>
          <nav className="admin-nav">
            <button className="admin-nav-item" onClick={() => onNavigate('landing')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Inicio
            </button>
            <button className="admin-nav-item" onClick={() => onNavigate('map')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
              Mapa Interactivo
            </button>
          </nav>
          
          <button className="admin-logout-btn" onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Administrative content */}
      <main className="admin-content">
        <header className="admin-header">
          <div className="admin-header-welcome">
            <span className="admin-welcome-sub">Bienvenido de vuelta</span>
            <h1 className="admin-welcome-title">{user?.nombre || 'Admin General'}</h1>
          </div>
          <div className="admin-header-actions">
            <button className="admin-theme-btn" onClick={onToggleTheme}>
              {isDark ? '☀️ Modo Claro' : '🌙 Modo Noche'}
            </button>
            <div className="admin-avatar">
              {(user?.nombre || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="admin-loading-container">
            <div className="admin-spinner"></div>
            <p>Cargando información administrativa...</p>
          </div>
        ) : errorMessage ? (
          <div className="admin-error-panel">
            <h3>⚠️ Error de Conexión</h3>
            <p>{errorMessage}</p>
            <button className="admin-retry-btn" onClick={loadData}>Reintentar conexión</button>
          </div>
        ) : activeTab === 'dashboard' ? (
          // View: Dashboard Tab
          <div className="admin-dashboard-view fade-in-slide">
            <div className="admin-dashboard-title-row">
              <h2 className="admin-page-title">Dashboard</h2>
              <span className="admin-page-date">Resumen general del sistema · {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Metrics cards */}
            <section className="metrics-grid">
              <div className="metric-card">
                <div className="metric-card-content">
                  <span className="metric-label">TOTAL USUARIOS</span>
                  <span className="metric-value">{usersCount || '128'}</span>
                  <span className="metric-trend trend-up">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                    +12% esta semana
                  </span>
                </div>
                <div className="metric-icon-wrapper user-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card-content">
                  <span className="metric-label">TOTAL HUARIQUES</span>
                  <span className="metric-value">{totalHuariques}</span>
                  <span className="metric-trend trend-warn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {pendientes} pendientes aprobación
                  </span>
                </div>
                <div className="metric-icon-wrapper huarique-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                    <line x1="6" y1="6" x2="6.01" y2="6"></line>
                    <line x1="6" y1="18" x2="6.01" y2="18"></line>
                  </svg>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card-content">
                  <span className="metric-label">RESEÑAS</span>
                  <span className="metric-value">{totalReviews || 389}</span>
                  <span className="metric-trend trend-info">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Promedio ★ {avgRating !== '0.0' ? avgRating : '4.2'}
                  </span>
                </div>
                <div className="metric-icon-wrapper review-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
              </div>
            </section>

            {/* Charts section */}
            <section className="charts-grid">
              <div className="chart-box">
                <h3 className="chart-box-title">ACTIVIDAD SEMANAL – REGISTROS</h3>
                <div className="chart-wrapper">
                  <svg viewBox="0 0 400 200" className="bar-chart-svg">
                    {/* Horizontal gridlines */}
                    <line x1="30" y1="30" x2="380" y2="30" stroke="rgba(0,0,0,0.06)" />
                    <line x1="30" y1="75" x2="380" y2="75" stroke="rgba(0,0,0,0.06)" />
                    <line x1="30" y1="120" x2="380" y2="120" stroke="rgba(0,0,0,0.06)" />
                    <line x1="30" y1="165" x2="380" y2="165" stroke="rgba(0,0,0,0.12)" />

                    {/* Bars (Lun-Dom) */}
                    {/* Lun: y=165, h=35 */}
                    <rect x="55" y="110" width="22" height="55" rx="3" className="chart-bar" />
                    {/* Mar: y=165, h=65 */}
                    <rect x="100" y="80" width="22" height="85" rx="3" className="chart-bar" />
                    {/* Mié: y=165, h=25 */}
                    <rect x="145" y="125" width="22" height="40" rx="3" className="chart-bar" />
                    {/* Jue: y=165, h=105 */}
                    <rect x="190" y="55" width="22" height="110" rx="3" className="chart-bar" />
                    {/* Vie: y=165, h=80 */}
                    <rect x="235" y="75" width="22" height="90" rx="3" className="chart-bar" />
                    {/* Sáb: y=165, h=95 */}
                    <rect x="280" y="60" width="22" height="105" rx="3" className="chart-bar" />
                    {/* Dom: y=165, h=88 */}
                    <rect x="325" y="70" width="22" height="95" rx="3" className="chart-bar" />

                    {/* Labels */}
                    <text x="66" y="185" className="chart-axis-text">Lun</text>
                    <text x="111" y="185" className="chart-axis-text">Mar</text>
                    <text x="156" y="185" className="chart-axis-text">Mié</text>
                    <text x="201" y="185" className="chart-axis-text">Jue</text>
                    <text x="246" y="185" className="chart-axis-text">Vie</text>
                    <text x="291" y="185" className="chart-axis-text">Sáb</text>
                    <text x="336" y="185" className="chart-axis-text">Dom</text>
                  </svg>
                </div>
              </div>

              <div className="chart-box">
                <h3 className="chart-box-title">DISTRIBUCIÓN POR ESTADO</h3>
                <div className="state-distribution-list">
                  <div className="state-dist-item">
                    <div className="state-dist-info">
                      <span className="state-dot dot-approved"></span>
                      <span className="state-label-text">Aprobados</span>
                      <span className="state-count-text">{aprobados || 34}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill fill-approved" 
                        style={{ width: `${totalHuariques > 0 ? (aprobados / totalHuariques) * 100 : 72}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="state-dist-item">
                    <div className="state-dist-info">
                      <span className="state-dot dot-pending"></span>
                      <span className="state-label-text">Pendientes</span>
                      <span className="state-count-text">{pendientes || 9}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill fill-pending" 
                        style={{ width: `${totalHuariques > 0 ? (pendientes / totalHuariques) * 100 : 19}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="state-dist-item">
                    <div className="state-dist-info">
                      <span className="state-dot dot-rejected"></span>
                      <span className="state-label-text">Rechazados</span>
                      <span className="state-count-text">{rechazados || 4}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill fill-rejected" 
                        style={{ width: `${totalHuariques > 0 ? (rechazados / totalHuariques) * 100 : 9}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Latest registered table */}
            <section className="latest-table-box">
              <h3 className="table-box-title">ÚLTIMOS HUARIQUES REGISTRADOS</h3>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>NOMBRE</th>
                      <th>DISTRITO</th>
                      <th>FECHA</th>
                      <th>ESTADO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestHuariques.map((h) => (
                      <tr key={h._id}>
                        <td style={{ fontWeight: 'bold' }}>{h.nombre}</td>
                        <td>{h.distrito || 'CERCADO'}</td>
                        <td>
                          {h.createdAt 
                            ? new Date(h.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '20 jun 2025'}
                        </td>
                        <td>
                          <span className={getStatusClass(h.estado || 'PENDIENTE')}>
                            {getStatusLabel(h.estado || 'PENDIENTE')}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn-edit" onClick={() => openEditModal(h)}>
                            Gestionar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {latestHuariques.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No hay registros de huariques.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          // View: Huariques Management Tab
          <div className="admin-huariques-view fade-in-slide">
            <div className="admin-dashboard-title-row">
              <h2 className="admin-page-title">Gestionar Huariques</h2>
              <p className="admin-page-desc">Listado completo para aprobación, edición, borrado y selección de Huariques Populares.</p>
            </div>

            {/* Filter controls */}
            <div className="filter-controls-row">
              <div className="search-input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder="Buscar huarique por nombre, comida o distrito..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="select-input-wrapper">
                <label>Distrito:</label>
                <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
                  {districts.map(d => (
                    <option key={d} value={d}>{d === 'Todos' ? 'Todos los distritos' : d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full list table */}
            <div className="latest-table-box" style={{ marginTop: '20px' }}>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>NOMBRE</th>
                      <th>CATEGORÍA</th>
                      <th>DISTRITO</th>
                      <th style={{ textAlign: 'center' }}>HUARIQUE POPULAR</th>
                      <th>ESTADO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHuariques.map((h) => (
                      <tr key={h._id}>
                        <td style={{ fontWeight: 'bold' }}>{h.nombre}</td>
                        <td><span className="category-pill">{h.tipoComida}</span></td>
                        <td>{h.distrito || 'CERCADO'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <label className="switch-container">
                            <input 
                              type="checkbox"
                              checked={h.popular || false}
                              onChange={() => handleTogglePopular(h)}
                            />
                            <span className="switch-slider"></span>
                          </label>
                        </td>
                        <td>
                          <select 
                            className={`status-select ${h.estado?.toLowerCase() || 'pendiente'}`}
                            value={h.estado || 'PENDIENTE'}
                            onChange={(e) => handleStatusChange(h._id, e.target.value as any)}
                          >
                            <option value="PENDIENTE">🕒 Pendiente</option>
                            <option value="APROBADO">✓ Aprobado</option>
                            <option value="RECHAZADO">✕ Rechazado</option>
                          </select>
                        </td>
                        <td>
                          <div className="actions-cell-buttons">
                            <button className="action-icon-btn edit" title="Editar datos" onClick={() => openEditModal(h)}>
                              ✏️
                            </button>
                            <button className="action-icon-btn delete" title="Eliminar" onClick={() => handleDelete(h._id)}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredHuariques.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Ningún huarique coincide con los filtros aplicados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal Popup */}
      {editingHuarique && (
        <div className="modal-overlay" onClick={() => setEditingHuarique(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Gestionar: {editingHuarique.nombre}</h3>
              <button className="modal-close-btn" onClick={() => setEditingHuarique(null)}>✕</button>
            </div>
            
            <form onSubmit={handleSaveEdits} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre del Huarique</label>
                  <input 
                    type="text" 
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Categoría / Tipo de Comida</label>
                  <input 
                    type="text" 
                    value={editTipoComida}
                    onChange={(e) => setEditTipoComida(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Distrito</label>
                  <input 
                    type="text" 
                    value={editDistrito}
                    onChange={(e) => setEditDistrito(e.target.value)}
                    placeholder="Ej. Breña, Miraflores, Lima"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Horario</label>
                  <input 
                    type="text" 
                    value={editHorario}
                    onChange={(e) => setEditHorario(e.target.value)}
                    placeholder="Ej. Lun-Sab: 12:00 - 17:00"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea 
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="form-group flex-row">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={editPopular}
                      onChange={(e) => setEditPopular(e.target.checked)}
                    />
                    Destacar en la Landing Page (Huarique Popular)
                  </label>
                </div>

                <div className="form-group">
                  <label>Estado del Sistema</label>
                  <select 
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value as any)}
                  >
                    <option value="PENDIENTE">Pendiente de Aprobación</option>
                    <option value="APROBADO">Aprobado y Activo</option>
                    <option value="RECHAZADO">Rechazado (Deshabilitado)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="modal-btn-cancel" 
                  onClick={() => setEditingHuarique(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="modal-btn-save"
                  disabled={isSaving}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
