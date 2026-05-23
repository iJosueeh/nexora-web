import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiClientService } from './api-client.service';
import { API_BASE_URL } from '../../core/tokens/api-endpoints.token';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let httpMock: HttpTestingController;
  const mockBaseUrl = 'http://api.nexora.com/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiClientService,
        { provide: API_BASE_URL, useValue: mockBaseUrl }
      ]
    });

    service = TestBed.inject(ApiClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should construct correct URL for GET request', () => {
    const testData = { id: 1, name: 'Test' };
    service.get('users').subscribe(data => {
      expect(data).toEqual(testData);
    });

    const req = httpMock.expectOne('http://api.nexora.com/users');
    expect(req.request.method).toBe('GET');
    req.flush(testData);
  });

  it('should construct correct URL for POST request', () => {
    const body = { name: 'New User' };
    service.post('users', body).subscribe();

    const req = httpMock.expectOne('http://api.nexora.com/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should construct correct URL for PUT request', () => {
    const body = { name: 'Updated User' };
    service.put('users/1', body).subscribe();

    const req = httpMock.expectOne('http://api.nexora.com/users/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should construct correct URL for DELETE request', () => {
    service.delete('users/1').subscribe();

    const req = httpMock.expectOne('http://api.nexora.com/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should handle paths starting with a slash correctly', () => {
    service.get('/path-with-slash').subscribe();
    httpMock.expectOne('http://api.nexora.com/path-with-slash');
  });
});

describe('ApiClientService without trailing slash', () => {
  let service: ApiClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiClientService,
        { provide: API_BASE_URL, useValue: 'http://api.nexora.com' }
      ]
    });

    service = TestBed.inject(ApiClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should handle base URL without trailing slash correctly', () => {
    service.get('test').subscribe();
    httpMock.expectOne('http://api.nexora.com/test');
  });
});
