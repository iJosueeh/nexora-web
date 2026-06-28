import { FeedTrendsBase } from './feed-trends/feed-trends';
import { Trend } from '../models/trend.model';
import { of } from 'rxjs';
import { FeedTagsService } from '../services/feed-tags.service';
import { FeedService } from '../services/feed.service';
import { provideRouter } from '@angular/router';
import { AuthSession } from '../../../core/services/auth-session';
import { ProfileService } from '../../profile/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { TestBed } from '@angular/core/testing';
import { signal, DestroyRef } from '@angular/core';

// Concrete implementation for testing logic only
class TestFeedTrends extends FeedTrendsBase {}

describe('FeedTrends Logic', () => {
  let component: TestFeedTrends;

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

    const mockAuthSession: Partial<AuthSession> = {
      getUser: () => ({ id: 'current-user' } as any),
      user: signal({ id: 'current-user' } as any)
    };

    const mockProfileService: Partial<ProfileService> = {
      getFollowing: () => of([]),
      toggleFollow: () => of(true)
    };

    const mockToastService: Partial<ToastService> = {
      show: vi.fn()
    };

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: FeedTagsService, useValue: mockFeedTags },
        { provide: FeedService, useValue: mockFeedService },
        { provide: AuthSession, useValue: mockAuthSession },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: ToastService, useValue: mockToastService },
        { provide: DestroyRef, useValue: { onDestroy: () => {} } },
        TestFeedTrends
      ]
    });

    component = TestBed.inject(TestFeedTrends);
  });

  it('should be initialized', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize trends signal with data', () => {
    component.ngOnInit();
    expect(component.trends()).toBeTruthy();
    expect(component.trends().length).toBeGreaterThan(0);
    expect(component.trends()[0].title).toBe('#Test');
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
    expect(component.trends().length).toBe(1);
    expect(component.trends()[0].title).toBe('#NewTrend');
  });
});
