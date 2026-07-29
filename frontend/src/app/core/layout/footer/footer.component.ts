import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VersionService } from '../../services/version.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private versionService = inject(VersionService);

  appVersion = this.versionService.version;
  readonly currentYear = new Date().getFullYear();
}
