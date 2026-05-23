import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { of } from 'rxjs';
import { CommentService } from '../../services/comment.service';
import { CommentThreadComponent } from './comment-thread';
import type { CommentThread } from '../../../../interfaces/feed/comment.model';

@Component({
  standalone: true,
  imports: [CommentThreadComponent],
  template: `<app-comment-thread [comment]="comment()" [depth]="0"></app-comment-thread>`
})
class HostComponent {
  comment = signal<CommentThread>({
    id: 'c1',
    author: { username: 'jdoe', fullName: 'John Doe' } as any,
    content: 'Hola mundo',
    createdAt: new Date(),
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
        replies: []
      })
    };

    await TestBed.configureTestingModule({
      imports: [HostComponent, ApolloTestingModule],
      providers: [provideRouter([]), { provide: CommentService, useValue: mockCommentService }]
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
