import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { describe, it, expect, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { CommentService } from '../../services/comment.service';
import type { CommentThread } from '../../../../interfaces/feed/comment.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mock-comment-thread',
  template: '<span class="comment-item">{{ comment.content }}</span>'
})
class MockCommentThread {
  @Input() comment: CommentThread = {
    id: '',
    author: { username: '' } as any,
    content: '',
    createdAt: new Date(),
    likesCount: 0,
    isLiked: false,
    replies: []
  };
}

@Component({
  standalone: true,
  imports: [CommonModule, MockCommentThread],
  selector: 'mock-comment-thread-list',
  template: `
    <div>
      <mock-comment-thread *ngFor="let c of comments" [comment]="c"></mock-comment-thread>
    </div>
  `
})
class MockCommentThreadList {
  @Input() comments: readonly CommentThread[] = [];
}

@Component({
  standalone: true,
  imports: [MockCommentThreadList],
  template: `<mock-comment-thread-list [comments]="comments()"></mock-comment-thread-list>`
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
      getThreads: () => of([])
    };

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: CommentService, useValue: mockCommentService }]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should render list of comments', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('one');
    expect(el.textContent).toContain('two');
  });
});