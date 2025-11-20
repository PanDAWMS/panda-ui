import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import {HeaderComponent} from "./core/layout/header/header.component";
import {FooterComponent} from "./core/layout/footer/footer.component";
import {AuthService} from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'frontend';

  constructor(
    private authService: AuthService,
    private primeng: PrimeNG
  ) {}

  ngOnInit() {
    // enable PrimeNG ripple effect
    this.primeng.ripple.set(true);
  }
}
