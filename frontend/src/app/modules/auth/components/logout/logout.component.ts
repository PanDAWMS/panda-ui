import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent implements OnInit {
  private authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    this.authService.logout();
  }
}
