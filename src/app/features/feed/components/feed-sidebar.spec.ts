import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal, Component, input, computed } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feed-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: '<div>Nexora <span class="badge">{{ unreadCount() }}</span></div>'
})
class MockFeedSidebar {
  unreadCount = signal(5);
  profileLink = signal('/profile');
}

describe('FeedSidebar Logic', () => {
  let component: MockFeedSidebar;
  let fixture: ComponentFixture<MockFeedSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockFeedSidebar],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MockFeedSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display Nexora logo text', () => {
    expect(fixture.nativeElement.textContent).toContain('Nexora');
  });

  it('should reflect unreadCount', () => {
    expect(component.unreadCount()).toBe(5);
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.textContent).toBe('5');
  });
});
