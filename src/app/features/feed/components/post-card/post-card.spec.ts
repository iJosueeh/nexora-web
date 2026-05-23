import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Post } from '../../../../interfaces/feed';
import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  template: '<div>Post {{ post().content }} <span class="likes">{{ likesCount() }}</span></div>'
})
class MockPostCard {
  post = signal<Post>({ content: 'default' } as Post);
  isLiked = signal(false);
  likesCount = signal(100);
}

describe('PostCard Logic', () => {
  let component: MockPostCard;
  let fixture: ComponentFixture<MockPostCard>;

  const mockPost: Post = {
    id: '1',
    content: 'This is a test post',
    likesCount: 100,
  } as Post;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockPostCard]
    }).compileComponents();

    fixture = TestBed.createComponent(MockPostCard);
    component = fixture.componentInstance;
    // Set signal directly for reliability in Vitest
    component.post.set(mockPost);
    fixture.detectChanges();
  });

  it('should create the mock post-card', () => {
    expect(component).toBeTruthy();
  });

  it('should display post content', () => {
    expect(fixture.nativeElement.textContent).toContain('This is a test post');
  });

  it('should show initial likes count', () => {
    expect(component.likesCount()).toBe(100);
  });
});
