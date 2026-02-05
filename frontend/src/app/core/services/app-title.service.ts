import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppTitleStrategy extends TitleStrategy {
  private readonly titleService = inject(Title);

  override updateTitle(routerState: RouterStateSnapshot): void {
    // Find the active leaf route, titleParam and its value if exist
    const title = this.buildTitle(routerState);
    let route = routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const paramName = route.data['titleParam'];
    const paramValue = paramName ? route.params[paramName] : null;

    if (paramValue) {
      this.titleService.setTitle(`UI | ${title} ${paramValue}`);
    } else if (title !== undefined) {
      this.titleService.setTitle(`UI | ${title}`);
    } else {
      this.titleService.setTitle('PanDA UI');
    }
  }
}
