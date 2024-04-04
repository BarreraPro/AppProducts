import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export default class AuthPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
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
        .signIn(this.form.value as User)
        .then((res) => {
          this.getUserInfo(res.user.uid);
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

  async getUserInfo(uid: string) {
    if (this.form.valid) {
      await this.utilisSV.loading();

      console.log(this.form.value);

      this.firebaseSV
        .getDocuments(`users/${uid}`)
        .then((user: User) => {
          this.utilisSV.saveToLocalStorage('user', user);
          this.utilisSV.routerLink('/main/home');
          this.form.reset();

          this.utilisSV.showToast({
            message: `Te damos la bienvenida ${user.name}`,
            color: 'danger',
            duration: 3000,
            position: 'middle',
            icon: 'person-circle-outline',
          });
        })
        .catch((err) => {
          console.log(err);
          this.utilisSV.showToast({
            message: err.message,
            color: 'primary',
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
