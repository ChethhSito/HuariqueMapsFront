export interface Resena {
  usuarioId: string;
  usuarioNombre: string;
  comentario: string;
  calificacion: number;
  fecha: string | Date;
}

export interface PointGeometry {
  type: 'Point';
  coordinates: number[]; // [longitud, latitud]
}

export interface Huarique {
  _id: string;
  nombre: string;
  descripcion: string;
  tipoComida: string;
  coordenadas: PointGeometry;
  horario: string;
  creadoPor?: string;
  votosExiste?: string[];
  votosNoExiste?: string[];
  resenas?: Resena[];
  ratingPromedio?: number;
  numResenas?: number;
  imagen?: string; // used for popularRestaurants
  distrito?: string;
  popular?: boolean;
  estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  createdAt?: string;
  imagenUrl?: string;
}
