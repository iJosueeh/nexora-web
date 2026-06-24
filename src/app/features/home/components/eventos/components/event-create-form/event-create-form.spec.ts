import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCreateForm } from './event-create-form';
import { EventService } from '../../services/event.service';
import { AuthSession } from '../../../../../../core/services/auth-session';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({ template: '', standalone: true })
class DummyComponent {}

describe('EventCreateForm', () => {
  let component: EventCreateForm;
  let fixture: ComponentFixture<EventCreateForm>;
  let eventServiceSpy: { createEvent: ReturnType<typeof vi.fn> };
  let authSpy: { isAuthenticated: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    eventServiceSpy = { createEvent: vi.fn().mockReturnValue(of({ id: '1', slug: 'test' })) };
    authSpy = { isAuthenticated: vi.fn().mockReturnValue(true) };

    await TestBed.configureTestingModule({
      imports: [EventCreateForm],
      providers: [
        provideRouter([
          { path: 'login', component: DummyComponent },
        ]),
        { provide: EventService, useValue: eventServiceSpy },
        { provide: AuthSession, useValue: authSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventCreateForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cancelled when cancel is called', () => {
    const spy = vi.fn();
    component.cancelled.subscribe(spy);
    component.cancel();
    expect(spy).toHaveBeenCalled();
  });

  it('should show error when title is empty', () => {
    component.title.set('');
    component.date.set('2025-01-01T10:00');
    component.submit();
    expect(component.error()).toBe('El título y la fecha son obligatorios');
    expect(eventServiceSpy.createEvent).not.toHaveBeenCalled();
  });

  it('should show error when date is empty', () => {
    component.title.set('Test Event');
    component.date.set('');
    component.submit();
    expect(component.error()).toBe('El título y la fecha son obligatorios');
  });

  it('should redirect to login if not authenticated', () => {
    authSpy.isAuthenticated.mockReturnValue(false);
    component.title.set('Test');
    component.date.set('2025-01-01T10:00');
    component.submit();
    expect(eventServiceSpy.createEvent).not.toHaveBeenCalled();
  });

  it('should call createEvent on valid submit', () => {
    component.title.set('Test Event');
    component.date.set('2025-01-01T10:00');
    component.description.set('A description');
    component.location.set('Location');
    component.category.set('Taller');

    component.submit();

    expect(eventServiceSpy.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Event',
        date: '2025-01-01T10:00',
        description: 'A description',
        location: 'Location',
        category: 'Taller',
      })
    );
  });

  it('should emit created on successful submit', () => {
    const spy = vi.fn();
    component.created.subscribe(spy);
    component.title.set('Test');
    component.date.set('2025-01-01T10:00');
    component.submit();
    expect(spy).toHaveBeenCalled();
  });

  it('should set error on createEvent failure', () => {
    eventServiceSpy.createEvent.mockReturnValue(throwError(() => new Error('Server error')));
    component.title.set('Test');
    component.date.set('2025-01-01T10:00');
    component.submit();
    expect(component.error()).toBe('Server error');
    expect(component.isSubmitting()).toBe(false);
  });
});
