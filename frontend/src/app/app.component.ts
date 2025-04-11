import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {HeaderComponent} from "./core/layout/header/header.component";
import {FooterComponent} from "./core/layout/footer/footer.component";
import {AuthService} from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgbModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'frontend';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Check if the user is authenticated on app initialization
    this.authService.checkAuth().subscribe();
  }
}
