import { Component } from '@angular/core';
import { RouterModule} from '@angular/router';
import { LoginComponent } from '../../auth/pages/login/login.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, LoginComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
