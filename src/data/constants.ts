import type { Huarique } from '../types';

export const FALLBACK_HUARIQUES: Huarique[] = [
  {
    _id: 'fallback-1',
    nombre: 'El Ceviche de Pedro',
    descripcion: 'Ceviche clásico de carretilla preparado al momento con pesca fresca del día, abundante limón piurano y choclo desgranado.',
    tipoComida: 'Marina',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.0305, -12.1611] // Chorrillos
    },
    horario: 'Mar - Dom: 11:00 AM - 4:30 PM'
  },
  {
    _id: 'fallback-2',
    nombre: 'Anticuchos del Puente',
    descripcion: 'Tradicionales brochetas de corazón a la parrilla marinados en ají panca y especias, acompañados de papas doradas y choclo tierno.',
    tipoComida: 'Criolla',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.0222, -12.1495] // Barranco
    },
    horario: 'Lun - Sáb: 6:00 PM - 11:30 PM'
  },
  {
    _id: 'fallback-3',
    nombre: 'El Rinconcito Lomeño',
    descripcion: 'Especialistas en lomo saltado ahumado al wok con cebolla crujiente, tomates jugosos y papas nativas amarillas fritas al instante.',
    tipoComida: 'Fusión / Criolla',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.036886, -12.046374] // Centro de Lima
    },
    horario: 'Lun - Dom: 12:00 PM - 10:00 PM'
  },
  {
    _id: 'fallback-4',
    nombre: 'El Huarique de la Tía Veneno',
    descripcion: 'Las mejores hamburguesas al paso y salchipapas de Lima.',
    tipoComida: 'Comida Rápida / Criolla',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.0358, -12.0825] // Lince
    },
    horario: 'Lun-Sab: 18:00 - 23:00'
  },
  {
    _id: 'fallback-5',
    nombre: 'Cevichería El Arrecife',
    descripcion: 'El ceviche de carretilla más fresco y picante de la zona.',
    tipoComida: 'Marina',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.029891, -12.121147] // Miraflores
    },
    horario: 'Mar-Dom: 11:30 - 16:30'
  }
];

export const CATEGORIES = ['Todos', 'Marina', 'Criolla', 'Chifas', 'China', 'Japonesa', 'Coreana', 'Fusión', 'Comida Rápida', 'Pollerías', 'Amazónica', 'Picanterías', 'Postres', 'Caldos/Sopas'];
