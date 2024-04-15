import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/products.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductsComponent } from 'src/app/shared/components/add-update-products/add-update-products.component';
import { orderBy } from 'firebase/firestore';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(
    private utilisSV: UtilsService,
    private firebaseSV: FirebaseService
  ) {}

  products: Product[] = [];
  loading: boolean = false;

  ngOnInit() {}

  // obtener el usuario
  user() {
    return this.utilisSV.getFromLocalStorage('user');
  }

  // ejecutar una función cuando se abra la vista
  ionViewDidEnter() {
    this.getProducts();
  }

  // refrescar
  doRefresh(event) {
    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 3000);
  }

  // obtener las ganancias
  // multiplicamos cada producto por la cantidad vendida y sumamos todos los resultados

  getIncome() {
    return this.products.reduce(
      (index, product) => index + product.praice * product.soldUnit,
      0
    );
  }

  signOut() {
    this.firebaseSV.signOut();
  }

  // obtener productos
  async getProducts() {
    let path = `users/${this.user().uid}/products`;

    this.loading = true;

    let query = orderBy('soldUnit', 'desc');

    let sub = (await this.firebaseSV.getCollectionData(path, query)).subscribe({
      next: (res: any) => {
        console.log(res);

        setTimeout(() => {
          this.loading = false;
          this.products = res;
        }, 1000);

        sub.unsubscribe();
      },
    });
  }

  async addUpdateProducts(product?: Product) {
    const modal = await this.utilisSV.presentModal({
      component: AddUpdateProductsComponent,
      cssClass: 'add-update-modal',
      componentProps: {
        product: product,
      },
    });
    const { data } = await modal.onDidDismiss();

    if (data) {
      this.getProducts();
    }
  }

  async presentAlertConfirm(product: Product) {
    this.utilisSV.presentAlert({
      header: 'Eliminar',
      message: '¿Estas seguro de eliminar este producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Sí, eliminar',
          handler: () => {
            this.deleteProduct(product);
          },
        },
      ],
    });
  }

  // eeliminar producto

  async deleteProduct(product: Product) {
    let path = `users/${this.user().uid}/products/${product.id}`;
    await this.utilisSV.loading();

    // subir la imagen y obtener la url

    let imagePath = await this.firebaseSV.getFilePath(product.image);
    await this.firebaseSV.deleteImageFile(imagePath);

    this.firebaseSV
      .deleteDocument(path)
      .then(async (res) => {
        this.utilisSV.showToast({
          header: 'Eliminado',
          message: 'Producto eliminado correctamente',
          color: 'success',
          duration: 1000,
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });

        this.products = this.products.filter((p) => p.id !== product.id);
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
