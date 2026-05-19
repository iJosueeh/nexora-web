import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';
import { GRAPHQL_URL } from '../../core/tokens/api-endpoints.token';
import { RouterTestingModule } from '@angular/router/testing';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home, RouterTestingModule],
      providers: [{ provide: GRAPHQL_URL, useValue: 'http://graphql.test' }],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
