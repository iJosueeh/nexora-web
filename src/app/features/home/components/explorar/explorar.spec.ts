import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { ExplorarPage } from './explorar';
import { ResourceService } from './services/resource.service';
import { AcademicResource, ResourceType } from '../../../../interfaces/resources';

const mockResources: AcademicResource[] = [
  {
    id: '1',
    title: 'Resource 1',
    description: 'Description 1',
    type: ResourceType.SUMMARY,
    category: { id: 'c1', name: 'Sistemas', career: { id: 'car1', name: 'Ingeniería' } },
    author: { id: '1', username: 'user1', fullName: 'Author 1', avatarUrl: null },
    fileUrl: 'https://example.com/file1.pdf',
    fileSize: 1024,
    fileFormat: 'PDF',
    averageRating: 4,
    ratingsCount: 10,
    userRating: null,
    downloadCount: 50,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  },
  {
    id: '2',
    title: 'Resource 2',
    description: 'Description 2',
    type: ResourceType.GUIDE,
    category: { id: 'c2', name: 'Industrial', career: { id: 'car2', name: 'Ingeniería' } },
    author: { id: '2', username: 'user2', fullName: 'Author 2', avatarUrl: null },
    fileUrl: 'https://example.com/file2.pdf',
    fileSize: 2048,
    fileFormat: 'PDF',
    averageRating: 3,
    ratingsCount: 5,
    userRating: null,
    downloadCount: 20,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  },
];

const mockCategories = [
  { id: 'c1', name: 'Sistemas', career: { id: 'car1', name: 'Ingeniería' } },
];

// Ensure IntersectionObserver is available in the test environment
// (the global mock in test-setup.ts may not always reach this spec)
if (typeof IntersectionObserver === 'undefined') {
  const mockObserver = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(), takeRecords: vi.fn().mockReturnValue([]) };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).IntersectionObserver = class {
    observe = mockObserver.observe;
    unobserve = mockObserver.unobserve;
    disconnect = mockObserver.disconnect;
    takeRecords = mockObserver.takeRecords;
    root = null;
    rootMargin = '0px';
    thresholds = [];
  };
}

describe('ExplorarPage', () => {
  let component: ExplorarPage;
  let fixture: ComponentFixture<ExplorarPage>;
  let resourceServiceSpy: {
    getResources: ReturnType<typeof vi.fn>;
    getResourceCategories: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    resourceServiceSpy = {
      getResources: vi.fn().mockReturnValue(of(mockResources)),
      getResourceCategories: vi.fn().mockReturnValue(of(mockCategories)),
    };

    await TestBed.configureTestingModule({
      imports: [ExplorarPage],
      providers: [
        provideRouter([]),
        { provide: ResourceService, useValue: resourceServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load resources on init', () => {
    expect(component.resources().length).toBeGreaterThan(0);
    expect(resourceServiceSpy.getResources).toHaveBeenCalled();
    expect(resourceServiceSpy.getResourceCategories).toHaveBeenCalled();
  });

  it('should update filters', () => {
    component.updateFilters({
      query: '',
      categoryId: 'c1',
      type: ResourceType.SUMMARY,
      minRating: null,
    });
    expect(component.filters().categoryId).toBe('c1');
    expect(component.filters().type).toBe(ResourceType.SUMMARY);
  });

  it('should show loading state while fetching', () => {
    resourceServiceSpy.getResources.mockReturnValue(of([]));
    component.updateFilters({ query: '', categoryId: null, type: null, minRating: null });
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });
});
