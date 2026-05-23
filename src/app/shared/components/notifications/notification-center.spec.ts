import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationCenterComponent } from './notification-center';
import { NotificationService } from '../../../core/services/notification.service';
import { signal, Component } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';

@Component({
  selector: 'app-test-notif-center',
  standalone: true,
  imports: [NotificationCenterComponent],
  template: '<app-notification-center />'
})
class TestHostComponent {}

describe('NotificationCenter Logic', () => {
  let notificationServiceMock: any;

  beforeEach(async () => {
    notificationServiceMock = {
      unreadCount: signal(2),
      notifications: signal([]),
      fetchHistory: vi.fn(),
      markAllAsRead: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should instantiate service and components correctly', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should provide access to notification counts via signal', () => {
    expect(notificationServiceMock.unreadCount()).toBe(2);
  });
});
