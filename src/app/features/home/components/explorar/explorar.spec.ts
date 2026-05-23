import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplorarPage } from './explorar';
import { provideRouter } from '@angular/router';
import { ResearchService } from './services/research.service';
import { of } from 'rxjs';
import { ResearchPaper } from './interfaces/research-paper.model';

describe('ExplorarPage', () => {
  let component: ExplorarPage;
  let fixture: ComponentFixture<ExplorarPage>;
  let researchServiceSpy: any;

  const mockPapers: ResearchPaper[] = [
    { 
      id: '1', 
      slug: 'p1', 
      title: 'Paper 1', 
      faculty: 'Sistemas', 
      author: { fullName: 'Author 1' }, 
      createdAt: '2024-01-01', 
      summary: 'Summary 1',
      views: 10
    },
    { 
      id: '2', 
      slug: 'p2', 
      title: 'Paper 2', 
      faculty: 'Industrial', 
      author: { fullName: 'Author 2' }, 
      createdAt: '2024-01-01', 
      summary: 'Summary 2',
      views: 20
    }
  ];

  beforeEach(async () => {
    researchServiceSpy = {
      getResearchPapers: vi.fn().mockReturnValue(of(mockPapers))
    };

    await TestBed.configureTestingModule({
      imports: [ExplorarPage],
      providers: [
        provideRouter([]),
        { provide: ResearchService, useValue: researchServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load papers on init', () => {
    expect(researchServiceSpy.getResearchPapers).toHaveBeenCalled();
    expect(component.papers()).toEqual(mockPapers);
  });

  it('should reload papers when category is selected', () => {
    component.selectCategory('Sistemas');
    fixture.detectChanges();
    expect(researchServiceSpy.getResearchPapers).toHaveBeenCalledWith(20, 0, 'Sistemas');
  });
});
