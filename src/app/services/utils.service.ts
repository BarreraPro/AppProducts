import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  AlertController,
  AlertOptions,
  LoadingController,
  ModalController,
  ModalOptions,
  ToastController,
  ToastOptions,
} from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  loandingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  rotes = inject(Router);
  modalCtrl = inject(ModalController);
  alertCrtl = inject(AlertController);

  async takePicture(promptLabelHeader: string) {
    return await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelHeader,
      promptLabelPhoto: 'Elegir una imagen de la galería',
      promptLabelPicture: 'Tomar una foto',
    });
  }

  async loading() {
    const loading = await this.loandingCtrl.create({
      message: 'Cargando...',
      duration: 3000,
      spinner: 'lines-sharp',
    });
    await loading.present();
  }

  // Alert
  async presentAlert(opts?: AlertOptions) {
    const alert = await this.alertCrtl.create(opts);

    await alert.present();
  }

  // Toast
  async showToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    await toast.present();
  }

  routerLink(url: string) {
    this.rotes.navigateByUrl(url);
  }

  // Guardar un elemento en el localStorage

  saveToLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  // Obtener un elemento del localStorage

  getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }

  // Modal

  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCtrl.create(opts);
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      return modal;
    }
    return modal;
  }

  dismissModal(data?: any) {
    this.modalCtrl.dismiss(data);
  }
}
