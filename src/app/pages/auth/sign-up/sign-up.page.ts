import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(30),
    ]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit() {}
  constructor(
    private firebaseSV: FirebaseService,
    private utilisSV: UtilsService
  ) {}

  async submit() {
    if (this.form.valid) {
      await this.utilisSV.loading();

      console.log(this.form.value);

      this.firebaseSV
        .signUp(this.form.value as User)
        .then(async (res) => {
          await this.firebaseSV.updateUser(this.form.value.name);

          let uid = res.user.uid;

          this.form.controls.uid.setValue(uid);

          this.setUserInfo(uid);
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

  navigateBack() {
    this.utilisSV.routerLink('/auth');
  }

  async setUserInfo(uid: string) {
    if (this.form.valid) {
      await this.utilisSV.loading();

      console.log(this.form.value);
      delete this.form.value.password;

      this.firebaseSV
        .setDocuments(`users/${uid}`, this.form.value as User)
        .then(async (res) => {
          this.utilisSV.saveToLocalStorage('user', this.form.value);
          this.utilisSV.routerLink('/main/home');
          this.form.reset();
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
}
