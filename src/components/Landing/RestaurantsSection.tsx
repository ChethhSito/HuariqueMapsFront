interface Restaurant {
  id: number;
  nombre: string;
  tipoComida: string;
  descripcion: string;
  horario: string;
  ubicacion: string;
  imagen: string;
}

interface RestaurantsSectionProps {
  popularRestaurants: Restaurant[];
}

export default function RestaurantsSection({ popularRestaurants }: RestaurantsSectionProps) {
  return (
    <section id="restaurantes" className="restaurants-section">
      <div className="section-container">
        <span className="section-tag">Recomendaciones</span>
        <h2 className="section-title">Huariques Populares</h2>
        <p className="restaurants-section-desc">
          Una selección de huariques tradicionales muy queridos por la comunidad.
          Explora su sabor único antes de ver su ubicación geoespacial en el mapa.
        </p>

        <div className="restaurants-grid">
          {popularRestaurants.map((res) => (
            <div key={res.id} className="restaurant-card">
              <div className="restaurant-img-wrapper">
                <img src={res.imagen} alt={res.nombre} className="restaurant-img" />
              </div>
              <div className="restaurant-card-body">
                <div className="restaurant-card-header">
                  <h3 className="restaurant-card-title">{res.nombre}</h3>
                  <span className="huarique-tag" style={{ margin: 0 }}>{res.tipoComida}</span>
                </div>
                <p className="restaurant-card-desc">{res.descripcion}</p>
                <div className="restaurant-card-footer">
                  <span>Horario: {res.horario}</span>
                  <span>Ubicación: {res.ubicacion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
