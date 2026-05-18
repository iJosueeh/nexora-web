import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { CommentService } from './comment.service';
import { Apollo } from 'apollo-angular';

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(() => {
    const mockApollo = { query: () => of({ data: { obtenerHilosComentarios: [
      { id: '1', postId: 'p1', parentId: null, autorId: 'u1', contenido: 'c1', createdAt: new Date().toISOString(), respuestas: [] }
    ] } }) } as any;

    TestBed.configureTestingModule({ providers: [{ provide: Apollo, useValue: mockApollo }, CommentService] });
    service = TestBed.inject(CommentService);
  });

  it('maps DTO to CommentThread model', (done) => {
    service.getThreads('p1').subscribe(result => {
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
      expect(result[0].content).toBe('c1');
      done();
    });
  });
});
