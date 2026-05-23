import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventosPage } from './eventos';
import { EventService } from './services/event.service';
import { of } from 'rxjs';
import { UniversityEvent } from './interfaces/event.model';
import { provideRouter } from '@angular/router';

describe('EventosPage', () => {
  let component: EventosPage;
  let fixture: ComponentFixture<EventosPage>;
  let eventServiceSpy: any;

  const mockEvents: UniversityEvent[] = [
    { id: '1', slug: 'e1', title: 'Event 1', category: 'Debate', attendeesCount: 5, date: '', description: '', location: '' },
    { id: '2', slug: 'e2', title: 'Event 2', category: 'Taller', attendeesCount: 10, date: '', description: '', location: '' }
  ];

  beforeEach(async () => {
    eventServiceSpy = {
      getEvents: vi.fn().mockReturnValue(of(mockEvents))
    };

    await TestBed.configureTestingModule({
      imports: [EventosPage],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: eventServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load events on init', () => {
    expect(eventServiceSpy.getEvents).toHaveBeenCalled();
    expect(component.events()).toEqual(mockEvents);
  });

  it('should reload events when category is selected', () => {
    component.selectCategory('Debate');
    fixture.detectChanges();
    expect(eventServiceSpy.getEvents).toHaveBeenCalledWith(20, 0, 'Debate');
  });
});
