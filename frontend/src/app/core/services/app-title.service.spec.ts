import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppTitleStrategy } from './app-title.service';

describe('AppTitleStrategy', () => {
  let strategy: AppTitleStrategy;
  let titleService: Title;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppTitleStrategy, { provide: Title, useValue: { setTitle: jasmine.createSpy('setTitle') } }],
    });
    strategy = TestBed.inject(AppTitleStrategy);
    titleService = TestBed.inject(Title);
  });

  it('should set a simple title when no params are involved', () => {
    const mockSnapshot = createMockSnapshot('Home', {}, {});
    // Mock buildTitle to return 'Home'
    spyOn(strategy, 'buildTitle').and.returnValue('Home');
    strategy.updateTitle(mockSnapshot);
    expect(titleService.setTitle).toHaveBeenCalledWith('UI | Home');
  });

  it('should automate the title using titleParam from data', () => {
    const mockSnapshot = createMockSnapshot('Task', { titleParam: 'jeditaskid' }, { jeditaskid: '4004142' });

    // Mock buildTitle to return 'Task'
    spyOn(strategy, 'buildTitle').and.returnValue('Task');

    strategy.updateTitle(mockSnapshot);
    expect(titleService.setTitle).toHaveBeenCalledWith('UI | Task 4004142');
  });

  it('should fallback to default when no title is provided', () => {
    const mockSnapshot = createMockSnapshot(undefined, {}, {});

    // Mock buildTitle to return undefined, simulating a route without a 'title' property
    spyOn(strategy, 'buildTitle').and.returnValue(undefined);

    strategy.updateTitle(mockSnapshot);
    expect(titleService.setTitle).toHaveBeenCalledWith('PanDA UI');
  });
});

/**
 * Helper to create a deep nested Mock of RouterStateSnapshot
 */
function createMockSnapshot(title: string | undefined, data: any, params: any): RouterStateSnapshot {
  const leaf = {
    title: title,
    data: data,
    params: params,
    firstChild: null,
  } as unknown as ActivatedRouteSnapshot;

  return {
    root: { firstChild: leaf },
    // buildTitle is a method of the strategy, we mock it or let it run
  } as unknown as RouterStateSnapshot;
}
