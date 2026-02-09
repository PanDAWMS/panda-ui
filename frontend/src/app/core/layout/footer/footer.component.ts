import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VersionService } from '../../services/version.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private versionService = inject(VersionService);

  appVersion = this.versionService.version;
  readonly currentYear = new Date().getFullYear();
}
