import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  getDownloadURL,
  ref,
  getStorage,
  uploadString,
  deleteObject,
} from 'firebase/storage';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  collectionData,
  query,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  routes = inject(Router);
  storage = inject(AngularFireStorage);

  // _____________AUTHENTICATION___________________

  getAuth() {
    return getAuth();
  }

  signIn(User: User) {
    return signInWithEmailAndPassword(getAuth(), User.email, User.password);
  }

  signUp(User: User) {
    return createUserWithEmailAndPassword(getAuth(), User.email, User.password);
  }

  updateUser(dispalyName: string) {
    return updateProfile(getAuth().currentUser, {
      displayName: dispalyName,
    });
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  signOut() {
    this.auth.signOut();
    localStorage.removeItem('user');
    this.routes.navigate(['/auth']);
  }

  // _____________Base de datos___________________

  // obtener documentos de una colección

  async getCollectionData(path: string, collectionQuery?: any) {
    const ref = collection(getFirestore(), path);
    return collectionData(query(ref, collectionQuery), { idField: 'id' });
  }

  // agregar documento

  async setDocuments(path: string, data: any) {
    console.log('Datos recibidos en setDocuments:', data);
    try {
      await setDoc(doc(getFirestore(), path), data);
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      throw error; // Re-lanza el error para manejarlo en el componente
    }
  }

  // obtener documento

  async getDocuments(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  // agregar documento
  addDocuments(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  // actualizar documento

  async updateDocument(path: string, data: any) {
    return updateDoc(doc(getFirestore(), path), data);
  }

  // eliminar documento

  async deleteDocument(path: string) {
    return deleteDoc(doc(getFirestore(), path));
  }

  // _____________Almacenamiento___________________

  //subir una imagen

  async uploadImage(path: string, dataUrl: string) {
    return uploadString(ref(getStorage(), path), dataUrl, 'data_url').then(
      () => {
        return getDownloadURL(ref(getStorage(), path));
      }
    );
  }

  // obtener ruta  de la imagen con la url

  async getFilePath(url: string) {
    return ref(getStorage(), url).fullPath;
  }

  // borrar imagen de almacenamiento en firebase

  async deleteImageFile(path: string) {
    return deleteObject(ref(getStorage(), path));
  }
}
