import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';
import { RouterTestingModule } from '@angular/router/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { of } from 'rxjs';
import { FeedTagsService } from '../feed/services/feed-tags.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    const mockFeedTags: Partial<FeedTagsService> = {
      getTrends: () => of([])
    };

    await TestBed.configureTestingModule({
      imports: [Home, RouterTestingModule, ApolloTestingModule],
      providers: [{ provide: FeedTagsService, useValue: mockFeedTags }]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
