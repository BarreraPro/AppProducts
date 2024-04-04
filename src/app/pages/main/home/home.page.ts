import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductsComponent } from 'src/app/shared/components/add-update-products/add-update-products.component';

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

  ngOnInit() {}

  signOut() {
    this.firebaseSV.signOut();
  }

  async addUpdateProducts() {
    const modal = await this.utilisSV.presentModal({
      component: AddUpdateProductsComponent,
      cssClass: 'add-update-modal',
    });
    const { data } = await modal.onDidDismiss();
    console.log('🚀 ~ HomePage ~ addUpdateProducts ~ data:', data);

    if (data) {
      return data;
    }
  }
}
