export interface EmojiCategory {
  name: string;
  emojis: EmojiData[];
}

export interface EmojiData {
  emoji: string;
  keywords: string[];
}

export const emojiCategories: EmojiCategory[] = [
  {
    name: 'Caras',
    emojis: [
      { emoji: '😀', keywords: ['cara', 'sonrisa', 'feliz', 'happy', 'smile'] },
      { emoji: '😃', keywords: ['cara', 'sonrisa', 'feliz', 'happy', 'smile', 'boca'] },
      { emoji: '😄', keywords: ['cara', 'sonrisa', 'feliz', 'ojo', 'happy'] },
      { emoji: '😁', keywords: ['sonrisa', 'diente', 'feliz', 'happy'] },
      { emoji: '😅', keywords: ['cara', 'sudor', 'nervioso', 'relieved'] },
      { emoji: '😂', keywords: ['llorar', 'risa', 'llanto', 'lol', 'laugh', 'cry'] },
      { emoji: '🤣', keywords: ['risa', 'rodando', 'rolling', 'laugh'] },
      { emoji: '😇', keywords: ['angel', 'inocente', 'halo', 'angel', 'innocent'] },
      { emoji: '🙂', keywords: ['cara', 'sonrisa', 'small', 'smile'] },
      { emoji: '😉', keywords: ['guiño', 'wink', 'ojos'] },
      { emoji: '😊', keywords: ['sonrisa', 'rubor', 'blush', 'feliz'] },
      { emoji: '😌', keywords: ['aliviado', 'relieved', 'tranquilo'] },
      { emoji: '😍', keywords: ['corazon', 'amor', 'love', 'ojos', 'corazon'] },
      { emoji: '🥰', keywords: ['corazon', 'amor', 'love', 'smiling'] },
      { emoji: '😘', keywords: ['beso', 'corazon', 'kiss', 'love'] },
      { emoji: '😎', keywords: ['cool', 'gafas', 'sunglasses', 'genial'] },
      { emoji: '🤔', keywords: ['pensando', 'thinking', 'pregunta'] },
      { emoji: '🤨', keywords: ['sospecha', 'duda', 'raised', 'eyebrow'] },
      { emoji: '😐', keywords: ['neutral', 'cara', '表情'] },
      { emoji: '😑', keywords: ['neutral', 'sin', 'expresion', 'blank'] },
      { emoji: '😶', keywords: ['boca', 'cerrada', 'quiet', 'silent'] },
      { emoji: '😏', keywords: ['sonrisa', 'malicia', 'smirk', 'sly'] },
      { emoji: '😒', keywords: ['aburrido', 'unamused', 'meh'] },
      { emoji: '🙄', keywords: ['ojos', 'rolling', 'exasperated'] },
      { emoji: '😬', keywords: ['grimacio', 'grimmace', 'dientes'] },
      { emoji: '😔', keywords: ['triste', 'sad', 'down', 'pensive'] },
      { emoji: '😷', keywords: ['enfermo', 'gripe', 'sick', 'mask'] },
      { emoji: '🤒', keywords: ['enfermo', 'fiebre', 'sick', 'thermometer'] },
    ]
  },
  {
    name: 'Gestos',
    emojis: [
      { emoji: '👍', keywords: ['pulgar', 'arriba', 'like', 'ok', 'good', 'up'] },
      { emoji: '👎', keywords: ['pulgar', 'abajo', 'dislike', 'down'] },
      { emoji: '👌', keywords: ['ok', 'perfecto', 'perfect', 'hand'] },
      { emoji: '✌️', keywords: ['paz', 'victoria', 'peace', 'v', 'victory'] },
      { emoji: '🤞', keywords: ['dedos', 'cruzados', 'crossed', 'luck'] },
      { emoji: '👏', keywords: ['aplauso', 'clap', 'bravo', 'hands'] },
      { emoji: '🙌', keywords: ['manos', 'arriba', 'hands', 'celebration'] },
      { emoji: '🤝', keywords: [' handshake', 'acuerdo', 'agreement', 'deal'] },
      { emoji: '🙏', keywords: ['gracias', 'please', 'pray', 'hands'] },
      { emoji: '💪', keywords: ['musculo', 'fuerza', 'strong', 'arm', 'bicep'] },
      { emoji: '🤙', keywords: ['llamar', 'call', 'phone', 'shaka'] },
      { emoji: '👋', keywords: ['hola', 'adios', 'wave', 'hand', 'hi'] },
      { emoji: '🖐️', keywords: ['mano', 'fingers', 'five'] },
      { emoji: '✋', keywords: ['mano', 'stop', 'hand', 'highfive'] },
      { emoji: '🤚', keywords: ['mano', 'raised', 'back', 'hand'] },
    ]
  },
  {
    name: 'Objetos',
    emojis: [
      { emoji: '📚', keywords: ['libro', 'libros', 'books', 'study', 'leer'] },
      { emoji: '🎓', keywords: ['graduacion', 'graduation', 'hat', 'university'] },
      { emoji: '🏫', keywords: ['escuela', 'colegio', 'school', 'building'] },
      { emoji: '📝', keywords: ['nota', 'notas', 'notes', 'memo', 'paper'] },
      { emoji: '📄', keywords: ['documento', 'document', 'pagina', 'page'] },
      { emoji: '📁', keywords: ['carpeta', 'folder', 'file'] },
      { emoji: '💻', keywords: ['computadora', 'laptop', 'computer', 'mac'] },
      { emoji: '📱', keywords: ['telefono', 'phone', 'movil', 'mobile'] },
      { emoji: '🔬', keywords: ['ciencia', 'microscopio', 'science', 'microscope'] },
      { emoji: '🧪', keywords: ['quimica', 'tubo', '试管', 'chemistry', 'test'] },
      { emoji: '📊', keywords: ['grafico', 'chart', 'estadistica', 'graph'] },
      { emoji: '💡', keywords: ['idea', 'lampara', 'idea', 'lightbulb', 'think'] },
      { emoji: '🔍', keywords: ['buscar', 'lupa', 'search', 'magnifying'] },
      { emoji: '📌', keywords: ['pin', 'agujero', 'pin', 'pushpin'] },
      { emoji: '📎', keywords: ['clip', 'paperclip', 'office'] },
      { emoji: '✏️', keywords: ['lapiz', 'pencil', 'write', 'draw'] },
      { emoji: '🖊️', keywords: ['boligrafo', 'pen', 'write'] },
      { emoji: '📷', keywords: ['camara', 'foto', 'camera', 'photo'] },
      { emoji: '🎥', keywords: ['video', 'camara', 'movie', 'video', 'camera'] },
      { emoji: '⏰', keywords: ['reloj', 'alarma', 'alarm', 'clock'] },
    ]
  },
  {
    name: 'Simbolos',
    emojis: [
      { emoji: '❤️', keywords: ['corazon', 'rojo', 'love', 'heart', 'red'] },
      { emoji: '🧡', keywords: ['corazon', 'naranja', 'heart', 'orange'] },
      { emoji: '💛', keywords: ['corazon', 'amarillo', 'heart', 'yellow'] },
      { emoji: '💚', keywords: ['corazon', 'verde', 'heart', 'green'] },
      { emoji: '💙', keywords: ['corazon', 'azul', 'heart', 'blue'] },
      { emoji: '💜', keywords: ['corazon', 'morado', 'heart', 'purple'] },
      { emoji: '✨', keywords: ['brillo', 'estrellas', 'sparkles', 'stars', 'shiny'] },
      { emoji: '🔥', keywords: ['fuego', 'fire', 'hot', 'flame', 'caliente'] },
      { emoji: '💥', keywords: ['explosion', 'boom', 'explosion', 'collision'] },
      { emoji: '⭐', keywords: ['estrella', 'star', 'favorite'] },
      { emoji: '🌟', keywords: ['estrella', 'brillante', 'star', 'glowing'] },
      { emoji: '💫', keywords: ['estrella', 'destello', 'dizzy', 'star', 'sparkle'] },
      { emoji: '🎉', keywords: ['fiesta', 'confeti', 'party', 'celebration', 'birthday'] },
      { emoji: '🎊', keywords: ['fiesta', 'confeti', 'party', 'balloon'] },
      { emoji: '✅', keywords: ['check', 'verde', 'si', 'yes', 'correct', 'tick'] },
      { emoji: '❌', keywords: ['cruz', 'no', 'wrong', 'incorrect', 'x'] },
      { emoji: '⚠️', keywords: ['advertencia', 'warning', 'alerta', 'caution'] },
      { emoji: '🔴', keywords: ['circulo', 'rojo', 'red', 'circle'] },
      { emoji: '🟢', keywords: ['circulo', 'verde', 'green', 'circle'] },
      { emoji: '💬', keywords: ['mensaje', 'chat', 'bubble', 'speech', 'comment'] },
      { emoji: '📢', keywords: ['megafono', 'anuncio', 'loudspeaker', 'announcement'] },
      { emoji: '🔗', keywords: ['enlace', 'link', 'chain', 'url'] },
    ]
  },
  {
    name: 'Actividades',
    emojis: [
      { emoji: '🏃', keywords: ['correr', 'running', 'run', 'deporte'] },
      { emoji: '🏋️', keywords: ['gimnasio', 'levantamiento', 'weight', 'gym', 'lift'] },
      { emoji: '🧘', keywords: ['yoga', 'meditacion', 'yoga', 'meditation'] },
      { emoji: '🎨', keywords: ['arte', 'pintura', 'art', 'palette', 'paint'] },
      { emoji: '🎭', keywords: ['teatro', 'drama', 'theater', 'drama', 'masks'] },
      { emoji: '🎵', keywords: ['musica', 'nota', 'music', 'note'] },
      { emoji: '🎶', keywords: ['musica', 'notas', 'music', 'notes'] },
      { emoji: '🎤', keywords: ['microfono', 'microphone', 'karaoke', 'sing'] },
      { emoji: '🎬', keywords: ['cine', 'claqueta', 'clapperboard', 'movie', 'film'] },
      { emoji: '⚽', keywords: ['futbol', 'soccer', 'football', 'ball'] },
      { emoji: '🏀', keywords: ['baloncesto', 'basketball', 'basket', 'ball'] },
      { emoji: '🎮', keywords: ['videojuegos', 'gaming', 'video', 'games', 'controller'] },
      { emoji: '🃏', keywords: ['cartas', 'cards', 'joker'] },
      { emoji: '♟️', keywords: ['ajedrez', 'chess', 'king', 'queen'] },
      { emoji: '🎯', keywords: ['diana', 'objetivo', 'target', 'darts', 'goal'] },
      { emoji: '🏆', keywords: ['trofeo', 'copa', 'trophy', 'cup', 'winner'] },
      { emoji: '🥇', keywords: ['medalla', 'oro', 'gold', 'medal', 'first'] },
      { emoji: '🥈', keywords: ['medalla', 'plata', 'silver', 'medal', 'second'] },
      { emoji: '🥉', keywords: ['medalla', 'bronce', 'bronze', 'medal', 'third'] },
    ]
  },
  {
    name: 'Comida',
    emojis: [
      { emoji: '🍕', keywords: ['pizza', 'comida', 'italiana', 'italian'] },
      { emoji: '🍔', keywords: ['hamburguesa', 'burger', 'comida', 'fast'] },
      { emoji: '🌮', keywords: ['taco', 'comida', 'mexicana', 'mexican'] },
      { emoji: '🍜', keywords: ['fideos', 'sopa', 'noodles', 'ramen', 'soup'] },
      { emoji: '🍣', keywords: ['sushi', 'comida', 'japonesa', 'japanese'] },
      { emoji: '🍱', keywords: ['caja', 'bentou', 'japanese', 'lunch'] },
      { emoji: '🍵', keywords: ['te', 'taza', 'tea', 'cup', 'drink'] },
      { emoji: '☕', keywords: ['cafe', 'coffee', 'cafe', 'drink'] },
      { emoji: '🧃', keywords: ['bebida', 'jugos', 'juice', 'box', 'drink'] },
      { emoji: '🍰', keywords: ['pastel', 'tarta', 'cake', 'dessert', 'sweet'] },
      { emoji: '🍩', keywords: ['dona', 'donut', 'rosquilla', 'sweet'] },
      { emoji: '🍎', keywords: ['manzana', 'apple', 'fruta', 'fruit', 'red'] },
      { emoji: '🍊', keywords: ['naranja', 'orange', 'fruta', 'fruit'] },
      { emoji: '🍋', keywords: ['limon', 'lemon', 'fruta', 'fruit', 'yellow'] },
      { emoji: '🍓', keywords: ['fresa', 'strawberry', 'fruta', 'fruit', 'red'] },
      { emoji: '🥑', keywords: ['aguacate', 'avocado', 'fruta', 'fruit', 'green'] },
      { emoji: '🥦', keywords: ['brocoli', 'verdura', 'vegetable', 'green'] },
      { emoji: '🍳', keywords: ['huevos', 'desayuno', 'eggs', 'breakfast', 'fried'] },
    ]
  }
];

export function searchEmojis(query: string): EmojiData[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const results: EmojiData[] = [];
  const seenEmojis = new Set<string>();

  for (const category of emojiCategories) {
    for (const emoji of category.emojis) {
      if (seenEmojis.has(emoji.emoji)) continue;
      
      const matchesKeyword = emoji.keywords.some(keyword =>
        keyword.toLowerCase().includes(normalizedQuery)
      );
      
      if (matchesKeyword) {
        results.push(emoji);
        seenEmojis.add(emoji.emoji);
      }
    }
  }

  return results.slice(0, 30);
}

export function getAllEmojis(): EmojiData[] {
  const all: EmojiData[] = [];
  const seen = new Set<string>();

  for (const category of emojiCategories) {
    for (const emoji of category.emojis) {
      if (!seen.has(emoji.emoji)) {
        all.push(emoji);
        seen.add(emoji.emoji);
      }
    }
  }

  return all;
}

export const quickEmojis = [
  '😀', '😂', '🥰', '😍', '🤔', '😎',
  '👍', '👏', '🙏', '💪', '🤝', '👋',
  '📚', '💡', '📝', '🎓', '💻', '📷',
  '❤️', '🔥', '✨', '⭐', '🎉', '✅'
];