import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../auth.service';
import {Observable} from 'rxjs';
import {UserProfile} from '../../../models/user.model';
import {CommonModule, NgIf} from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [NgIf, CommonModule],
  templateUrl: './user-profile.component.html',
  standalone: true,
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  user$!: Observable<UserProfile | null>;
  token$: Observable<string | null>;
  loadingToken: boolean = false;

  constructor(private router: Router, private authService: AuthService) {
    this.user$ = this.authService.getUser();
    this.token$ = this.authService.token$();
  }

  loadToken() {
    this.loadingToken = true;
    this.authService.getUserToken().subscribe({
      next: () => {
        this.loadingToken = false;
      },
      error: (err) => {
        console.error("Failed to load token", err);
        this.loadingToken = false;
      }
    });
  }
}
