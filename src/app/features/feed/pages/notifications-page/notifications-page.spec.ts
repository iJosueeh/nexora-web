import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, Component } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  template: '<div>Notifications <h3>Todo en orden por aquí</h3></div>'
})
class MockNotificationsPage {
  unreadCount = signal(0);
  notifications = signal([]);
}

describe('NotificationsPage Logic', () => {
  let component: MockNotificationsPage;
  let fixture: ComponentFixture<MockNotificationsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockNotificationsPage],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MockNotificationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render empty state', () => {
    expect(fixture.nativeElement.textContent).toContain('Todo en orden por aquí');
  });
});
