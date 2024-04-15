import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import ImageCompressor from 'image-compressor.js';
import { Product } from 'src/app/models/products.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-products',
  templateUrl: './add-update-products.component.html',
  styleUrls: ['./add-update-products.component.scss'],
})
export class AddUpdateProductsComponent implements OnInit {
  @Input() product: Product;

  form = new FormGroup({
    id: new FormControl(''),
    image: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    praice: new FormControl(null, [Validators.required, Validators.min(0)]),
    soldUnit: new FormControl(null, [Validators.required, Validators.min(0)]),
  });

  ngOnInit() {
    this.user = this.utilisSV.getFromLocalStorage('user');
    if (this.product) {
      this.form.setValue(this.product);
    }
  }
  constructor(
    private firebaseSV: FirebaseService,
    private utilisSV: UtilsService
  ) {}

  user = {} as User;

  // tomar una imagen de la galeria o camara

  async takeimage() {
    // Capturar la imagen con la calidad original
    const originalDataUrl = (
      await this.utilisSV.takePicture('imagen del producto')
    ).dataUrl;

    // Crear un elemento de lienzo (canvas)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Crear una nueva imagen con la calidad reducida
    const image = new Image();
    image.src = originalDataUrl;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    // Definir el tamaño del lienzo para que coincida con el de la imagen original
    canvas.width = image.width;
    canvas.height = image.height;

    // Dibujar la imagen en el lienzo con la calidad reducida
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Obtener la URL de la imagen con la calidad reducida
    const reducedQualityDataUrl = canvas.toDataURL('image/jpeg', 0.1); // Aquí puedes ajustar el factor de calidad según lo necesites

    // Asignar la URL de la imagen con la calidad reducida al control del formulario
    this.form.controls.image.setValue(reducedQualityDataUrl);
  }

  async submit() {
    if (this.form.valid) {
      if (this.product) this.updateProduct();
      else this.createProduct();
    }
  }

  // Convertir valores de tipo string a number

  setNumberInput() {
    let { soldUnit, praice } = this.form.controls;
    if (soldUnit.value) soldUnit.setValue(parseFloat(soldUnit.value));
    if (praice.value) praice.setValue(parseFloat(praice.value));
  }

  // agregar producto

  async createProduct() {
    if (this.form.valid) {
      let path = `users/${this.user.uid}/products`;
      await this.utilisSV.loading();

      // subir la imagen y obtener la url

      let dataUrl = this.form.value.image;
      let imagePath = `${this.user.uid}/${Date.now()}`;
      let imageUrl = await this.firebaseSV.uploadImage(imagePath, dataUrl);

      this.form.controls.image.setValue(imageUrl);

      delete this.form.value.id;

      this.firebaseSV
        .addDocuments(path, this.form.value)
        .then(async (res) => {
          this.utilisSV.dismissModal({ success: true });

          console.log(res);
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
  }

  // actualizar un producto
  async updateProduct() {
    let path = `users/${this.user.uid}/products/${this.product.id}`;
    await this.utilisSV.loading();

    //si cambio la imagen, subir la imagen nueva y obtener la url
    if (!this.form.value.image) {
      let dataUrl = this.form.value.image;
      let imagePath = await this.firebaseSV.getFilePath(this.product.id);
      let imageUrl = await this.firebaseSV.uploadImage(imagePath, dataUrl);
      this.form.controls.image.setValue(imageUrl);
    }

    delete this.form.value.id;

    this.firebaseSV
      .updateDocument(path, this.form.value)
      .then(async (res) => {
        this.utilisSV.dismissModal({ success: true });

        console.log(res);
        this.utilisSV.showToast({
          message: 'Producto actualizado exitosamente',
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

  // Eliminar un producto

  navigateBack() {
    this.utilisSV.routerLink('/auth');
  }
}
