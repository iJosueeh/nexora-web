import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResearchCard } from './research-card';
import { ResearchPaper } from '../../interfaces/research-paper.model';
import { provideRouter } from '@angular/router';

describe('ResearchCard', () => {
  let component: ResearchCard;
  let fixture: ComponentFixture<ResearchCard>;

  const mockPaper: ResearchPaper = {
    id: '1',
    slug: 'test-paper',
    title: 'Test Paper',
    author: { fullName: 'Test Author' },
    faculty: 'Sistemas',
    createdAt: '2024-01-01',
    summary: 'Test Summary',
    views: 100
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchCard],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ResearchCard);
    component = fixture.componentInstance;
    
    // Set required input
    fixture.componentRef.setInput('paper', mockPaper);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display paper title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain(mockPaper.title);
  });

  it('should display paper faculty', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // The faculty is usually inside a span or a specific class. 
    // Checking content is safer if structure varies.
    expect(fixture.nativeElement.textContent).toContain(mockPaper.faculty);
  });
});
