import { ResearchPaper } from '../interfaces/research-paper.model';

export const RESEARCH_PAPERS_MOCK: ResearchPaper[] = [
  {
    id: '1',
    slug: 'optimizacion-algoritmos-ia',
    title: 'Optimización de Algoritmos en IA',
    faculty: 'Sistemas',
    createdAt: '2024-04-12T10:00:00Z',
    summary: 'Un estudio sobre la eficiencia de redes neuronales en entornos de baja computación.',
    views: 1250,
    author: {
        fullName: 'Juan Pérez',
        avatarUrl: ''
    }
  },
  {
    id: '2',
    slug: 'arquitectura-sostenible-lima',
    title: 'Arquitectura Sostenible en Lima',
    faculty: 'Arquitectura',
    createdAt: '2024-04-08T10:00:00Z',
    summary: 'Propuesta de materiales biodegradables para construcciones urbanas.',
    views: 890,
    author: {
        fullName: 'María Garcia',
        avatarUrl: ''
    }
  },
  {
    id: '3',
    slug: 'impacto-marketing-digital',
    title: 'Impacto del Marketing Digital',
    faculty: 'Marketing',
    createdAt: '2024-04-05T10:00:00Z',
    summary: 'Análisis de tendencias en redes sociales para el sector retail en Perú. Este estudio abarca más de 500 empresas.',
    views: 2100,
    author: {
        fullName: 'Carlos Ruiz',
        avatarUrl: ''
    }
  },
  {
    id: '4',
    slug: 'investigacion-sin-datos-completos',
    title: 'Estudio Preliminar de Materiales',
    faculty: 'Industrial',
    createdAt: '2024-05-01T10:00:00Z',
    summary: 'Resumen corto.',
    views: 10,
    author: {
        fullName: 'Anónimo',
        avatarUrl: ''
    }
  }
];
