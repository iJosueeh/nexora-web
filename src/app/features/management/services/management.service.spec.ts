import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManagementService } from './management.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { GRAPHQL_URL } from '../../../core/tokens/api-endpoints.token';

describe('ManagementService', () => {
  let service: ManagementService;
  let httpClientSpy: any;

  beforeEach(() => {
    httpClientSpy = {
      post: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ManagementService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: GRAPHQL_URL, useValue: 'http://localhost:8080/graphql' }
      ]
    });

    service = TestBed.inject(ManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load dashboard stats successfully', () => {
    const mockStats = {
      totalUsers: 10,
      totalPosts: 5,
      activeEvents: 2,
      recentActivity: []
    };

    httpClientSpy.post.mockReturnValue(of({ data: { adminStats: mockStats } }));

    service.loadDashboardStats();

    expect(service.stats()).toEqual(mockStats);
    expect(service.loading()).toBe(false);
  });

  it('should handle error when loading dashboard stats', () => {
    httpClientSpy.post.mockReturnValue(throwError(() => new Error('GraphQL Error')));

    service.loadDashboardStats();

    expect(service.stats()).toBeNull();
    expect(service.loading()).toBe(false);
  });

  it('should load users and append them when requested', async () => {
    const initialUsers = [{ id: '1', fullName: 'User 1' }];
    const newUsers = [{ id: '2', fullName: 'User 2' }];

    service.users.set(initialUsers as any);
    httpClientSpy.post.mockReturnValue(of({ data: { allUsers: newUsers } }));

    await firstValueFrom(service.loadUsers(10, 0, true));

    expect(service.users().length).toBe(2);
    expect(service.users()[1].fullName).toBe('User 2');
  });

  it('should update user status successfully', async () => {
    const mockProfile = { id: '1', email: 'test@test.com', profileComplete: true };
    httpClientSpy.post.mockReturnValue(of({ data: { updateUserStatus: mockProfile } }));

    const result = await firstValueFrom(service.updateUserStatus('1', true));
    expect(result).toEqual(mockProfile);
  });
});
