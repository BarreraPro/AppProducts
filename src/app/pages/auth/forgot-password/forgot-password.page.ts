import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  constructor(
    private firebaseSV: FirebaseService,
    private utilisSV: UtilsService
  ) {}

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      await this.utilisSV.loading();

      this.firebaseSV
        .resetPassword(this.form.value.email)
        .then((res) => {
          this.utilisSV.routerLink('/auth');

          this.utilisSV.showToast({
            message: 'Contraseña restablecida',
            color: 'success',
            duration: 3000,
            position: 'top',
            icon: 'checkmark-circle-outline',
          });
        })
        .catch((err) => {
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
}
