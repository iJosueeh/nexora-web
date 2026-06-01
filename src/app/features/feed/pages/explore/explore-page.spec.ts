import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplorePageBase } from './explore-page';
import { FeedTagsService } from '../../services/feed-tags.service';
import { FeedService } from '../../services/feed.service';
import { FeedPaginationQueueService } from '../../services/feed-pagination-queue.service';
import { AuthSession } from '../../../../core/services/auth-session';
import { ProfileService } from '../../../profile/services/profile.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { signal, DestroyRef } from '@angular/core';

// Concrete implementation for testing logic only
class TestExplorePage extends ExplorePageBase {}

describe('ExplorePage Logic', () => {
  let component: TestExplorePage;
  let mockFeedTags: any;
  let mockFeedService: any;
  let mockPagination: any;
  let mockAuth: any;
  let mockProfile: any;

  beforeEach(async () => {
    mockFeedTags = {
      getTrends: vi.fn().mockReturnValue(of([]))
    };
    mockFeedService = {
      getPosts: vi.fn().mockReturnValue(of([]))
    };
    mockPagination = {
      enqueue: vi.fn().mockReturnValue(of([]))
    };
    mockAuth = {
      getUser: vi.fn().mockReturnValue({ id: '1', username: 'test' })
    };
    mockProfile = {
      getFollowing: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Apollo, useValue: {} },
        { provide: FeedTagsService, useValue: mockFeedTags },
        { provide: FeedService, useValue: mockFeedService },
        { provide: FeedPaginationQueueService, useValue: mockPagination },
        { provide: AuthSession, useValue: mockAuth },
        { provide: ProfileService, useValue: mockProfile },
        { provide: DestroyRef, useValue: { onDestroy: () => {} } },
        TestExplorePage
      ]
    });

    component = TestBed.inject(TestExplorePage);
  });

  it('should be initialized', () => {
    expect(component).toBeTruthy();
  });

  it('should change active tab', () => {
    component.setTab('multimedia');
    expect(component.activeTab()).toBe('multimedia');
    
    component.setTab('articulos');
    expect(component.activeTab()).toBe('articulos');
  });

  it('should toggle trends visibility', () => {
    expect(component.showAllTrends()).toBe(false);
    component.toggleTrends();
    expect(component.showAllTrends()).toBe(true);
    component.toggleTrends();
    expect(component.showAllTrends()).toBe(false);
  });

  it('should update selected trend and load posts', () => {
    const trend = { title: '#Angular', category: 'TECH', conversations: '10' };
    component.selectTrend(trend);
    
    expect(component.selectedTrend()).toBe('Angular');
    expect(mockPagination.enqueue).toHaveBeenCalledWith(15, 0, 'Angular');
  });
});
