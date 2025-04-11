import {Component, OnInit} from '@angular/core';
import {CommonModule, NgIf} from '@angular/common';
import { AuthService } from '../../auth.service';
import {UserProfile} from '../../../models/user.model';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  user: UserProfile|null = null;
  loading: boolean = true;

  constructor(
    private authService: AuthService
  ) {}


  ngOnInit(): void {
    this.authService.getUser().subscribe(user => {
        this.user = user;
        console.debug("Current user:", this.user);
    });
  }

  login() {
    this.authService.login();
  }
}


