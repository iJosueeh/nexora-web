import { UniversityEvent } from '../interfaces/event.model';

export const EVENTS_MOCK: UniversityEvent[] = [
  {
    id: '1',
    slug: 'debate-ia-etica-profesional',
    title: 'Debate: IA en la Ética Profesional',
    description: 'Un espacio para discutir los límites morales de la inteligencia artificial en el campo laboral.',
    date: '15 Mayo, 2024',
    location: 'Auditorio Central, Torre A',
    category: 'Debate',
    attendeesCount: 45,
    image: 'assets/images/hero-bg.jpg',
    isUserRegistered: false,
    organizer: {
      name: 'Facultad de Sistemas',
      role: 'Organización Académica'
    },
    communityLinks: {
      whatsapp: 'https://chat.whatsapp.com/example',
      discord: 'https://discord.gg/example'
    }
  },
  {
    id: '2',
    slug: 'taller-python-data-science',
    title: 'Taller de Python para Data Science',
    description: 'Aprende las librerías fundamentales para el análisis de datos académicos.',
    date: '20 Mayo, 2024',
    location: 'Laboratorio L-402',
    category: 'Taller',
    attendeesCount: 30,
    image: 'assets/images/bg-login.webp',
    isUserRegistered: false,
    organizer: {
      name: 'IEEE Student Branch',
      role: 'Comunidad Estudiantil'
    },
    communityLinks: {
      telegram: 'https://t.me/example'
    }
  },
  {
    id: '3',
    slug: 'feria-proyectos-ingenieria',
    title: 'Feria de Proyectos de Ingeniería',
    description: 'Exposición de los mejores trabajos finales del ciclo 2024-I.',
    date: '25 Mayo, 2024',
    location: 'Patio de Ingeniería',
    category: 'Feria',
    attendeesCount: 120,
    image: 'assets/images/hero-bg.jpg',
    isUserRegistered: false,
    organizer: {
      name: 'Dirección de Carrera',
      role: 'Administración'
    },
    communityLinks: {
      whatsapp: 'https://chat.whatsapp.com/example-feria'
    }
  },
  {
    id: '4',
    slug: 'evento-minimalista',
    title: 'Charla Relámpago: Git Avanzado',
    description: 'Sesión rápida de comandos ocultos.',
    date: '30 Mayo, 2024',
    location: 'Sala de Juntas B',
    category: 'Taller',
    attendeesCount: 5,
    isUserRegistered: false
  }
];
