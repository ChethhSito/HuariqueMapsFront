import { db, auth } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  getDoc
} from 'firebase/firestore';
import type { Huarique } from '../types';

export async function getHuariques(): Promise<Huarique[]> {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey || apiKey === "mock-api-key") {
    throw new Error("Firebase no está configurado (usando credenciales mock).");
  }

  const querySnapshot = await getDocs(collection(db, 'huariques'));
  const list: Huarique[] = [];
  querySnapshot.forEach((docSnap) => {
    list.push({
      _id: docSnap.id,
      ...docSnap.data()
    } as Huarique);
  });
  return list;
}

export async function createHuarique(huariqueData: any, _token: string): Promise<Huarique> {
  const currentUser = auth.currentUser;
  
  const docRef = await addDoc(collection(db, 'huariques'), {
    ...huariqueData,
    creadoPor: currentUser?.displayName || currentUser?.email || 'Usuario Local',
    votosExiste: [],
    votosNoExiste: [],
    resenas: [],
    ratingPromedio: 0,
    numResenas: 0,
    createdAt: new Date().toISOString()
  });

  const newDoc = await getDoc(docRef);
  return {
    _id: docRef.id,
    ...newDoc.data()
  } as Huarique;
}

export async function validateHuarique(huariqueId: string, existe: boolean, _token: string): Promise<Huarique> {
  const currentUser = auth.currentUser;
  const userIdentifier = currentUser?.email || currentUser?.uid || 'usuario_anonimo';

  const docRef = doc(db, 'huariques', huariqueId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Huarique no encontrado');
  }

  const data = docSnap.data();
  let votosExiste = data.votosExiste || [];
  let votosNoExiste = data.votosNoExiste || [];

  // Limpiar votos anteriores de este usuario
  votosExiste = votosExiste.filter((uid: string) => uid !== userIdentifier);
  votosNoExiste = votosNoExiste.filter((uid: string) => uid !== userIdentifier);

  if (existe) {
    votosExiste.push(userIdentifier);
  } else {
    votosNoExiste.push(userIdentifier);
  }

  await updateDoc(docRef, {
    votosExiste,
    votosNoExiste
  });

  return {
    _id: huariqueId,
    ...data,
    votosExiste,
    votosNoExiste
  } as Huarique;
}

export async function addReview(huariqueId: string, reviewData: any, _token: string): Promise<Huarique> {
  const currentUser = auth.currentUser;
  
  const docRef = doc(db, 'huariques', huariqueId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Huarique no encontrado');
  }

  const data = docSnap.data();
  const resenas = data.resenas || [];

  const nuevaResena = {
    usuarioId: currentUser?.uid || 'anonimo',
    usuarioNombre: currentUser?.displayName || reviewData.usuarioNombre || 'Usuario',
    comentario: reviewData.comentario || reviewData.text,
    calificacion: reviewData.calificacion || reviewData.rating,
    fecha: new Date().toISOString()
  };

  resenas.push(nuevaResena);

  // Recalcular rating promedio
  const totalCalificacion = resenas.reduce((sum: number, r: any) => sum + r.calificacion, 0);
  const numResenas = resenas.length;
  const ratingPromedio = Math.round((totalCalificacion / numResenas) * 10) / 10;

  await updateDoc(docRef, {
    resenas,
    numResenas,
    ratingPromedio
  });

  return {
    _id: huariqueId,
    ...data,
    resenas,
    numResenas,
    ratingPromedio
  } as Huarique;
}
