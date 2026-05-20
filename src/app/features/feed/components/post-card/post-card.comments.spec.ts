import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RouterTestingModule } from '@angular/router/testing';
import { PostCardComponent } from './post-card';
import { CommentService } from '../../services/comment.service';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import type { Post } from '../../../../interfaces/feed/post.model';

@Component({
  standalone: true,
  imports: [PostCardComponent],
  template: `<app-post-card [post]="post()"></app-post-card>`
})
class HostComponent {
  post = signal<Post>({
    id: 'p1',
    title: 't',
    content: 'c',
    createdAt: new Date(),
    likesCount: 0,
    commentsCount: 0,
    shares: 0,
    isLiked: false,
    author: {
      username: 'u1',
      fullName: 'User One',
      avatar: '',
      role: 'Estudiante'
    } as any
  } as any);
}

describe('PostCardComponent - comments', () => {
  let fixture: ComponentFixture<HostComponent>;
  const mockCommentService = { getThreads: vi.fn(() => of([])) } as any;
  const mockApollo = { mutate: vi.fn(() => of({ data: {} })) } as any;
  const mockToastr = { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, RouterTestingModule],
      providers: [
        { provide: CommentService, useValue: mockCommentService },
        { provide: Apollo, useValue: mockApollo },
        { provide: ToastrService, useValue: mockToastr }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should toggle comments and call service', async () => {
    const component = fixture.debugElement.query(By.directive(PostCardComponent)).componentInstance as PostCardComponent;
    component.toggleComments(new MouseEvent('click'));
    expect(mockCommentService.getThreads).toHaveBeenCalled();
  });
});
