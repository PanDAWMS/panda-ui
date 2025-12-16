import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-home',
  imports: [],
  providers: [MessageModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
