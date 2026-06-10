import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { emojiCategories, EmojiData, searchEmojis } from './emoji-data';

@Component({
  selector: 'app-emoji-picker-mini',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block">
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-all hover:bg-white/10 hover:text-white"
        (click)="togglePicker()"
        title="Emojis"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </button>

      @if (isOpen()) {
        <div class="absolute right-0 top-full z-50 mt-1 w-[min(20rem,calc(100vw-1rem))] max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a1a] p-3 shadow-xl">
          <!-- Search -->
          <div class="mb-3">
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearch($event)"
              placeholder="Buscar emoji..."
              class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#df3432] focus:outline-none"
            />
          </div>

          @if (searchQuery().length >= 3) {
            <!-- Search Results -->
            @if (searchResults().length > 0) {
              <div class="grid grid-cols-8 gap-0.5">
                @for (result of searchResults(); track result.emoji) {
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-md text-xl transition-colors hover:bg-white/10"
                    (click)="selectEmoji(result.emoji)"
                  >
                    {{ result.emoji }}
                  </button>
                }
              </div>
            } @else {
              <p class="py-4 text-center text-sm text-white/40">Sin resultados</p>
            }
          } @else {
            <!-- All Categories Stacked -->
            @for (category of emojiCategories; track category.name) {
              <div class="mb-3 last:mb-0">
                <p class="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                  {{ category.name }}
                </p>
                <div class="grid grid-cols-8 gap-0.5">
                  @for (emojiData of category.emojis; track emojiData.emoji) {
                    <button
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-md text-xl transition-colors hover:bg-white/10"
                      (click)="selectEmoji(emojiData.emoji)"
                    >
                      {{ emojiData.emoji }}
                    </button>
                  }
                </div>
              </div>
            }
          }
        </div>
        <div 
          class="fixed inset-0 z-40 cursor-pointer" 
          (click)="close()" 
          (keydown.escape)="close()" 
          tabindex="-1"
        ></div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    :host ::-webkit-scrollbar {
      width: 6px;
    }

    :host ::-webkit-scrollbar-track {
      background: transparent;
    }

    :host ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    :host ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `]
})
export class EmojiPickerMiniComponent {
  readonly emojiSelected = output<string>();

  readonly emojiCategories = emojiCategories;
  readonly isOpen = signal(false);
  readonly searchQuery = signal('');
  readonly searchResults = signal<EmojiData[]>([]);

  togglePicker(): void {
    this.isOpen.update(v => !v);
    if (!this.isOpen()) {
      this.searchQuery.set('');
      this.searchResults.set([]);
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const query = target?.value ?? '';
    this.searchQuery.set(query);

    if (query.length >= 3) {
      this.searchResults.set(searchEmojis(query));
    } else {
      this.searchResults.set([]);
    }
  }

  selectEmoji(emoji: string): void {
    this.emojiSelected.emit(emoji);
    this.close();
  }
}