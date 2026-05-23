import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedTrends } from './feed-trends/feed-trends';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { Trend, SuggestedUser } from '../models/trend.model';
import { of } from 'rxjs';
import { FeedTagsService } from '../services/feed-tags.service';
import { FeedService } from '../services/feed.service';

describe('FeedTrends Component', () => {
  let component: FeedTrends;
  let fixture: ComponentFixture<FeedTrends>;

  beforeEach(async () => {
    const mockFeedTags: Partial<FeedTagsService> = {
      getTrends: (search = '', limit = 6) =>
        of([
          { category: 'TENDENCIAS EN CIENCIA', title: '#Test', conversations: '10K' }
        ] as Trend[])
    };

    const mockFeedService: Partial<FeedService> = {
      getPosts: (limit = 20, offset = 0) =>
        of([
          {
            id: 'p1',
            content: 'Test content',
            createdAt: new Date(),
            likesCount: 0,
            commentsCount: 0,
            shares: 0,
            isLiked: false,
            author: { id: 'u1', username: 'tester', fullName: 'Tester', avatar: null }
          } as any
        ])
    };

    await TestBed.configureTestingModule({
      imports: [FeedTrends, ApolloTestingModule],
      providers: [
        { provide: FeedTagsService, useValue: mockFeedTags },
        { provide: FeedService, useValue: mockFeedService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedTrends);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the feed-trends component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize trends signal with default data', () => {
    expect(component.trends()).toBeTruthy();
    expect(component.trends().length).toBeGreaterThan(0);
  });

  it('should initialize suggestedUsers signal with default data', () => {
    expect(component.suggestedUsers()).toBeTruthy();
    expect(component.suggestedUsers().length).toBeGreaterThan(0);
  });

  it('should display Tendencias Actuales heading', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Tendencias Actuales');
  });

  it('should have sticky positioning', () => {
    const aside = fixture.nativeElement.querySelector('aside');
    expect(aside.classList.contains('sticky')).toBe(true);
    expect(aside.classList.contains('top-0')).toBe(true);
  });

  it('should update trends when signal is set', () => {
    const newTrends: Trend[] = [
      {
        category: 'Technology',
        title: '#NewTrend',
        conversations: '50K',
      },
    ];
    component.trends.set(newTrends);
    fixture.detectChanges();
    expect(component.trends().length).toBe(1);
    expect(component.trends()[0].title).toBe('#NewTrend');
  });

  it('should have correct background color for trends sidebar', () => {
    const aside = fixture.nativeElement.querySelector('aside');
    expect(aside.classList.contains('bg-[var(--brand-black)]')).toBe(true);
  });

  it('should have border styling on trends sidebar', () => {
    const aside = fixture.nativeElement.querySelector('aside');
    expect(aside.classList.contains('border-[var(--brand-border)]')).toBe(true);
  });
});
