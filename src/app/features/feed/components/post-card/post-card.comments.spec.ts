import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RouterTestingModule } from '@angular/router/testing';
import { PostCardComponent } from './post-card';
import { CommentService } from '../../services/comment.service';
import { of } from 'rxjs';
import type { Post } from '../../../interfaces/feed/post.model';

@Component({
  standalone: true,
  imports: [PostCardComponent],
  template: `<app-post-card [post]="post"></app-post-card>`
})
class HostComponent {
  post = signal<Post>({ id: 'p1', title: 't', content: 'c', isLiked: false } as any);
}

describe('PostCardComponent - comments', () => {
  let fixture: ComponentFixture<HostComponent>;
  const mockCommentService = { getThreads: vi.fn(() => Promise.resolve([])) } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent, RouterTestingModule], providers: [{ provide: CommentService, useValue: mockCommentService }] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should toggle comments and call service', async () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    const btn = hostEl.querySelector('button[data-test="toggle-comments"]') as HTMLButtonElement;
    btn.click();
    expect(mockCommentService.getThreads).toHaveBeenCalled();
  });
});
