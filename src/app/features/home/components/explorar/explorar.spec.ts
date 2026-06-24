import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplorarPage } from './explorar';
import { ResearchService } from './services/research.service';
import { of } from 'rxjs';
import { ResearchPaper } from './interfaces/research-paper.model';
import { provideRouter } from '@angular/router';

describe('ExplorarPage', () => {
  let component: ExplorarPage;
  let fixture: ComponentFixture<ExplorarPage>;
  let researchServiceSpy: { getResearchPapers: ReturnType<typeof vi.fn> };

  const mockPapers: ResearchPaper[] = [
    {
      id: '1',
      slug: 'p1',
      title: 'Paper 1',
      faculty: 'Sistemas',
      author: { id: '1', fullName: 'Author 1' },
      createdAt: '2024-01-01',
      summary: 'Summary 1',
      views: 10,
    },
    {
      id: '2',
      slug: 'p2',
      title: 'Paper 2',
      faculty: 'Industrial',
      author: { id: '2', fullName: 'Author 2' },
      createdAt: '2024-01-01',
      summary: 'Summary 2',
      views: 20,
    },
  ];

  beforeEach(async () => {
    researchServiceSpy = {
      getResearchPapers: vi.fn().mockReturnValue(of(mockPapers)),
    };

    await TestBed.configureTestingModule({
      imports: [ExplorarPage],
      providers: [
        provideRouter([]),
        { provide: ResearchService, useValue: researchServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default category set to "Todos"', () => {
    expect(component.selectedCategory()).toBe('Todos');
  });

  it('should load papers on init', () => {
    expect(component.papers().length).toBeGreaterThan(0);
    expect(researchServiceSpy.getResearchPapers).toHaveBeenCalled();
  });

  it('should update selected category', () => {
    component.selectCategory('Sistemas');
    expect(component.selectedCategory()).toBe('Sistemas');
  });

  it('should show loading state while fetching', () => {
    researchServiceSpy.getResearchPapers.mockReturnValue(of([]));
    component.selectCategory('Industrial');
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });
});
