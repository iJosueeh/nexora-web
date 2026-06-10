import { Stat } from '../interfaces/stat.model';

export const STATS_MOCK: Stat[] = [
  { id: 1, value: '5k+', numericValue: 5000, suffix: 'k+', label: 'Estudiantes Activos', highlight: false },
  { id: 2, value: '1.2k+', numericValue: 1200, suffix: 'k+', label: 'Proyectos de Investigación', highlight: true },
  { id: 3, value: '50+', numericValue: 50, suffix: '+', label: 'Comunidades Especializadas', highlight: false },
];
