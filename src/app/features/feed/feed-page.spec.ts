import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FeedPage } from './pages/feed-page/feed-page';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { NotificationService } from '../../core/services/notification.service';
import { signal } from '@angular/core';

describe('FeedPage Component', () => {
  let component: FeedPage;
  let fixture: ComponentFixture<FeedPage>;

  beforeEach(async () => {
    const mockApollo = { query: () => of({ data: {} }), mutate: () => of({ data: {} }) } as any;
    const mockNotificationService = {
      notifications: signal([]),
      unreadCount: signal(0),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [FeedPage, RouterTestingModule],
      providers: [
        { provide: Apollo, useValue: mockApollo },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedPage);
    component = fixture.componentInstance;
  });

  it('should create the feed-page component', () => {
    expect(component).toBeTruthy();
  });

  it('should have main content with rounded classes', () => {
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(main.classList.contains('rounded-2xl')).toBe(true);
  });

  it('should display feed header', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Lo ultimo');
  });

  it('should render app-feed-sidebar component', () => {
    fixture.detectChanges();
    const sidebarComponent = fixture.nativeElement.querySelector('app-feed-sidebar');
    expect(sidebarComponent).toBeTruthy();
  });

  it('should render app-feed-trends component', () => {
    fixture.detectChanges();
    const trendsComponent = fixture.nativeElement.querySelector('app-feed-trends');
    expect(trendsComponent).toBeTruthy();
  });

  it('should render app-feed-container component', () => {
    fixture.detectChanges();
    const containerComponent = fixture.nativeElement.querySelector('app-feed-container');
    expect(containerComponent).toBeTruthy();
  });

  it('should have proper background class in main content', () => {
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(main.classList.contains('bg-[#0d0e12]')).toBe(true);
  });
});
