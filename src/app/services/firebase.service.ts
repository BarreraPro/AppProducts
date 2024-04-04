import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  getDownloadURL,
  ref,
  uploadBytes,
  getStorage,
  uploadString,
} from 'firebase/storage';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

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

  async setDocuments(path: string, data: any) {
    console.log('Datos recibidos en setDocuments:', data);
    try {
      await setDoc(doc(getFirestore(), path), data);
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      throw error; // Re-lanza el error para manejarlo en el componente
    }
  }

  async getDocuments(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  addDocuments(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  // _____________Almacenamiento___________________

  //subir una imagen

  // async uploadImage(path: string, dataUrl: string) {
  //   try {
  //     // Subir la imagen como una cadena a Firebase Storage
  //     await uploadString(ref(getStorage(), path), dataUrl, 'data_url');

  //     // Obtener la URL de descarga de la imagen
  //     const downloadURL = await getDownloadURL(ref(getStorage(), path));

  //     return downloadURL;
  //   } catch (error) {
  //     // Manejar cualquier error que pueda ocurrir durante la subida de la imagen
  //     console.error('Error al subir la imagen:', error);
  //     throw error;
  //   }
  // }
  uploadImage(dataUrl: string, filePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Crear una referencia al almacenamiento de Firebase
      const storageRef = this.storage.ref(filePath);

      // Extraer el contenido base64 de la URL de la imagen
      const base64Content = dataUrl.split(',')[1];

      // Convertir el contenido base64 en un blob
      const byteCharacters = atob(base64Content);
      const byteArrays = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteArrays], { type: 'image/jpeg' });

      // Subir el blob al almacenamiento de Firebase
      const uploadTask = storageRef.put(blob);

      // Obtener la URL de descarga después de que la carga se complete
      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(() => {
            storageRef.getDownloadURL().subscribe(
              (url) => {
                resolve(url);
              },
              (error) => {
                reject(error);
              }
            );
          })
        )
        .subscribe();
    });
  }
}
