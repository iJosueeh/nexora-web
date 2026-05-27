import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { RouterTestingModule } from '@angular/router/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { of } from 'rxjs';
import { CommentService } from '../../services/comment.service';
import { CommentThreadListComponent } from './comment-thread-list';
import type { CommentThread } from '../../../../interfaces/feed/comment.model';

@Component({
  standalone: true,
  imports: [CommentThreadListComponent],
  template: `<app-comment-thread-list [comments]="comments()"></app-comment-thread-list>`
})
class HostComponent {
  comments = signal<CommentThread[]>([
    { id: 'c1', author: { username: 'a' } as any, content: 'one', createdAt: new Date(), replies: [], likesCount: 0, isLiked: false },
    { id: 'c2', author: { username: 'b' } as any, content: 'two', createdAt: new Date(), replies: [], likesCount: 0, isLiked: false }
  ]);
}

describe('CommentThreadListComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    const mockCommentService: Partial<CommentService> = {
      getThreads: () => of([]),
      createComment: () => of({
        id: 'new-c',
        content: 'new',
        createdAt: new Date(),
        author: { username: 'test' } as any,
        likesCount: 0,
        isLiked: false,
        replies: []
      })
    };

    await TestBed.configureTestingModule({ imports: [HostComponent, RouterTestingModule, ApolloTestingModule], providers: [{ provide: CommentService, useValue: mockCommentService }] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should render list of comments', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('one');
    expect(el.textContent).toContain('two');
  });
});
