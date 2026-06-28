import { PostDetailPageBase } from './post-detail';
import { FeedService } from '../../services/feed.service';
import { AuthSession } from '../../../../core/services/auth-session';
import { ToastService } from '../../../../core/services/toast.service';
import { of } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal, DestroyRef } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CommentService } from '../../services/comment.service';
import { TestBed } from '@angular/core/testing';

// Concrete implementation for testing logic only
class TestPostDetailPage extends PostDetailPageBase {}

describe('PostDetailPage Logic', () => {
  let component: TestPostDetailPage;
  let mockFeedService: any;
  let mockCommentService: any;
  let mockAuthSession: any;
  let mockToast: any;
  let mockApollo: any;

  const mockPost = {
    id: 'post-123',
    title: 'Post Title',
    content: 'Post Content',
    author: { id: 'user-456', fullName: 'Author', username: 'author' },
    createdAt: new Date(),
    likesCount: 0,
    commentsCount: 0,
    tags: []
  };

  beforeEach(async () => {
    mockFeedService = {
      getPostById: vi.fn().mockReturnValue(of(mockPost)),
      editPost: vi.fn().mockReturnValue(of(mockPost)),
      toggleLike: vi.fn().mockReturnValue(of(true))
    };
    mockCommentService = {
      getThreads: vi.fn().mockReturnValue(of([])),
      createComment: vi.fn().mockReturnValue(of({}))
    };
    mockAuthSession = {
      getUser: vi.fn().mockReturnValue({ id: 'user-456' }), // Same as author
      user: signal({ id: 'user-456' })
    };
    mockToast = {
      show: vi.fn()
    };
    mockApollo = {
      mutate: vi.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'post-123' } },
            params: of({ id: 'post-123' }),
            paramMap: of({ get: () => 'post-123' })
          }
        },
        { provide: Apollo, useValue: mockApollo },
        { provide: FeedService, useValue: mockFeedService },
        { provide: CommentService, useValue: mockCommentService },
        { provide: AuthSession, useValue: mockAuthSession },
        { provide: ToastService, useValue: mockToast },
        { provide: DestroyRef, useValue: { onDestroy: () => {} } },
        TestPostDetailPage
      ]
    });

    component = TestBed.inject(TestPostDetailPage);
  });

  it('should be initialized', () => {
    expect(component).toBeTruthy();
  });

  it('should identify owner correctly', () => {
    component.post.set(mockPost as any);
    expect(component.isOwner()).toBe(true);
  });

  it('should identify non-owner correctly', () => {
    mockAuthSession.getUser.mockReturnValue({ id: 'other-user' });
    component.post.set(mockPost as any);
    expect(component.isOwner()).toBe(false);
  });

  it('should enter edit mode', () => {
    component.post.set(mockPost as any);
    component.startEdit();
    expect(component.isEditing()).toBe(true);
    expect(component.editTitle()).toBe('Post Title');
    expect(component.editContent()).toBe('Post Content');
  });

  it('should cancel edit mode', () => {
    component.isEditing.set(true);
    component.cancelEdit();
    expect(component.isEditing()).toBe(false);
  });

  it('should save edits and update post', () => {
    component.post.set(mockPost as any);
    component.startEdit();
    component.editTitle.set('New Title');
    component.editContent.set('New Content');
    
    component.saveEdit();
    
    expect(mockFeedService.editPost).toHaveBeenCalled();
    expect(mockToast.show).toHaveBeenCalledWith(expect.any(String), 'success');
  });
});
