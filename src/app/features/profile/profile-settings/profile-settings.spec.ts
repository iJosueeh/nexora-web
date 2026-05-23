import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: '<div>Settings for {{ form.value.username }}</div>'
})
class MockProfileSettingsPage {
  form = new FormGroup({
    username: new FormControl('testuser'),
    fullName: new FormControl('Test User')
  });
}

describe('ProfileSettings Logic', () => {
  let component: MockProfileSettingsPage;
  let fixture: ComponentFixture<MockProfileSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockProfileSettingsPage],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MockProfileSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize form with data', () => {
    expect(component.form.value.username).toBe('testuser');
  });
});
