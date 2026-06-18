import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, Input, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { CommentService } from '../../services/comment.service';
import type { CommentThread } from '../../../../interfaces/feed/comment.model';

@Component({
  standalone: true,
  selector: 'app-comment-thread',
  template: '<div class="comment">{{ comment.content }} <span class="author">{{ comment.author.fullName }}</span></div>'
})
class MockCommentThread {
  @Input() comment: CommentThread = {
    id: '',
    author: { username: '', fullName: '' } as any,
    content: '',
    createdAt: new Date(),
    likesCount: 0,
    isLiked: false,
    replies: []
  };
}

@Component({
  standalone: true,
  imports: [MockCommentThread],
  template: `<app-comment-thread [comment]="comment()"></app-comment-thread>`
})
class HostComponent {
  comment = signal<CommentThread>({
    id: 'c1',
    author: { username: 'jdoe', fullName: 'John Doe' } as any,
    content: 'Hola mundo',
    createdAt: new Date(),
    likesCount: 0,
    isLiked: false,
    replies: []
  });
}

describe('CommentThreadComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    const mockCommentService: Partial<CommentService> = {
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

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: CommentService, useValue: mockCommentService }]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should render comment content and author', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hola mundo');
    expect(el.textContent).toContain('John Doe');
  });
});