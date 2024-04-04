import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-products',
  templateUrl: './add-update-products.component.html',
  styleUrls: ['./add-update-products.component.scss'],
})
export class AddUpdateProductsComponent implements OnInit {
  form = new FormGroup({
    id: new FormControl(''),
    image: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    praice: new FormControl('', [Validators.required, Validators.min(0)]),
    soldUnit: new FormControl('', [Validators.required, Validators.min(0)]),
  });

  ngOnInit() {
    this.user = this.utilisSV.getFromLocalStorage('user');
  }
  constructor(
    private firebaseSV: FirebaseService,
    private utilisSV: UtilsService,
    private storage: AngularFireStorage
  ) {}

  user = {} as User;
  private format: string;
  // tomar una imagen de la galeria o camara

  async takeimage() {
    const image = await this.utilisSV.takePicture('imagen del producto');
    this.format = image.format;
    if (image) {
      this.form.get('image').setValue(image.dataUrl);
    }
  }

  async submit() {
    if (this.form.valid) {
      let path = `users/${this.user.uid}/products`;
      await this.utilisSV.loading();

      // subir la imagen y obtener la url

      let dataUrl = this.form.value.image;
      var base64Data = dataUrl.split(',')[1];
      var formatoEsperado = 'data:image/jpeg;base64,' + base64Data;

      let newPath = `${this.user.uid}/${Date.now()}`;

      await this.firebaseSV
        .uploadImage(formatoEsperado, newPath)
        .then((url) => {
          this.form.controls.image.setValue(url);
          this.uploadDocumentFireStore(url);
          console.log('Image uploaded and available at: ', url);
        })
        .catch((error) => {
          console.error('Error uploading image: ', error);
        });
    }
  }
  uploadDocumentFireStore(path: string) {
    delete this.form.value.id;
    const pathDocument: string = `ImagesRegister/${
      this.user.uid
    }+/${Date.now()}`;
    let anonymousObject = {
      pathImage: path,
      idUser: this.user.uid,
    };
    this.firebaseSV
      .addDocuments('ImagesRegister', anonymousObject)
      .then(async (res) => {
        this.utilisSV.dismissModal({ success: true });

        console.log({ res });

        this.utilisSV.showToast({
          message: 'Producto agregado correctamente',
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
  navigateBack() {
    this.utilisSV.routerLink('/auth');
  }
}
