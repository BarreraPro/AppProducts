import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  constructor(
    private router: Router,
    private utililsSV: UtilsService,
    private firebaseSV: FirebaseService
  ) {}

  pages = [
    {
      title: 'Inicio',
      url: '/main/home',
      icon: 'home-outline',
    },
    {
      title: 'Profile',
      url: '/main/profile',
      icon: 'person-outline',
    },
  ];

  currentPage: string = '';

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if (event && event.url) {
        this.currentPage = event.url;
      }
    });
  }

  signOut() {
    this.firebaseSV.signOut();
  }

  // Datos del usuario

  user(): User {
    return this.utililsSV.getFromLocalStorage('user');
  }
}
