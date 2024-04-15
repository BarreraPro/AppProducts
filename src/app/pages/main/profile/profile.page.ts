import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/products.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  constructor(
    private firebaseSV: FirebaseService,
    private utilisSV: UtilsService
  ) {}

  ngOnInit() {}

  user(): User {
    return this.utilisSV.getFromLocalStorage('user');
  }

  // Tomar/ Elegir una imagen de la galería

  async takePicture() {
    let user = this.user();

    let path = `users/${user.uid}`;

    const dataUrl = (await this.utilisSV.takePicture('imagen del perfil'))
      .dataUrl;
    await this.utilisSV.loading();
    let imagePath = `${user.uid}/profile`;
    user.image = await this.firebaseSV.uploadImage(imagePath, dataUrl);

    this.firebaseSV
      .updateDocument(path, { image: user.image })
      .then(async (res) => {
        this.utilisSV.saveToLocalStorage('user', user);
        this.utilisSV.showToast({
          message: 'Imagen actualizada',
          color: 'success',
          duration: 1000,
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((err) => {
        console.log(err);
        this.utilisSV.showToast({
          message: err.message,
          color: 'danger',
          duration: 3000,
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        this.utilisSV.loandingCtrl.dismiss();
      });
  }
}
