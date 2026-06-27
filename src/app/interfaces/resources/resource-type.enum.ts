export enum ResourceType {
  SUMMARY = 'SUMMARY',
  GUIDE = 'GUIDE',
  FLASHCARD = 'FLASHCARD',
  EXAM = 'EXAM',
  OTHER = 'OTHER',
}

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  [ResourceType.SUMMARY]: 'Resumen',
  [ResourceType.GUIDE]: 'Guía',
  [ResourceType.FLASHCARD]: 'Flashcard',
  [ResourceType.EXAM]: 'Examen',
  [ResourceType.OTHER]: 'Otro',
};
