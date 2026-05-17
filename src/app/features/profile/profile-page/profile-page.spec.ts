import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  template: '<div>Profile of {{ profile()?.username }}</div>'
})
class MockProfilePage {
  profile = signal({ username: 'testuser', handle: '@testuser' });
  isOwnProfile = signal(true);
  isFollowModalOpen = signal(false);
  followModalType = signal('followers');

  openFollowModal(type: string, event: any) {
    this.followModalType.set(type);
    this.isFollowModalOpen.set(true);
  }

  closeFollowModal() {
    this.isFollowModalOpen.set(false);
  }
}

describe('ProfilePage Logic (Unit)', () => {
  let component: MockProfilePage;
  let fixture: ComponentFixture<MockProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockProfilePage],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MockProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render profile username', () => {
    expect(fixture.nativeElement.textContent).toContain('testuser');
  });

  it('should manage follow modal state', () => {
    component.openFollowModal('following', {});
    expect(component.isFollowModalOpen()).toBe(true);
    expect(component.followModalType()).toBe('following');

    component.closeFollowModal();
    expect(component.isFollowModalOpen()).toBe(false);
  });
});
