import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FeedTagsService } from '../../../../services/feed-tags.service';

@Component({
  selector: 'app-publication-tags-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-2">
      <label for="tags-search" class="text-xs font-semibold uppercase tracking-[0.08em] text-white/40">
        Etiquetas
      </label>

      <div class="relative">
        <input
          id="tags-search"
          type="text"
          [value]="searchQuery()"
          (input)="onSearchChange($event)"
          (focus)="openDropdown()"
          (blur)="closeDropdown()"
          placeholder="Busca o añade etiquetas..."
          class="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#df3432] focus:outline-none"
        />

        @if (isOpen() && filteredTags().length > 0) {
          <div
            class="absolute top-full left-0 right-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg"
          >
            @for (tag of filteredTags(); track tag) {
              <button
                type="button"
                (click)="selectTag(tag)"
                class="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-[#df3432]/15 hover:text-[#df3432] transition-colors"
              >
                {{ tag }}
              </button>
            }
          </div>
        }
      </div>

      @if (selectedTags().length > 0) {
        <div class="flex flex-wrap gap-2">
          @for (tag of selectedTags(); track tag) {
            <div class="inline-flex items-center gap-2 rounded-full bg-[#df3432]/15 px-3 py-1">
              <span class="text-xs font-medium text-[#df3432]">{{ tag }}</span>
              <button
                type="button"
                (click)="removeTag(tag)"
                class="text-[#df3432] hover:text-[#b82a29] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6l-12 12M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class PublicationTagsSelectComponent {
  readonly tagsService = inject(FeedTagsService);

  readonly selectedTagsInput = input<string[]>([]);
  readonly tagsChanged = output<string[]>();

  readonly searchQuery = signal('');
  readonly isOpen = signal(false);
  readonly allTags = signal<string[]>([]);
  readonly selectedTags = signal<string[]>([]);

  readonly filteredTags = computed(() => {
    const selected = this.selectedTags();
    return this.allTags().filter((tag: string) => !selected.includes(tag));
  });

  constructor() {
    this.loadTags('');

    effect(() => {
      this.selectedTags.set(this.selectedTagsInput());
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const query = target?.value ?? '';
    this.searchQuery.set(query);
    this.loadTags(query);
  }

  selectTag(tag: string): void {
    if (!this.selectedTags().includes(tag)) {
      const updated = [...this.selectedTags(), tag];
      this.selectedTags.set(updated);
      this.tagsChanged.emit(updated);
      this.searchQuery.set('');
    }
  }

         removeTag(tag: string): void {
           const updated = this.selectedTags().filter((t: string) => t !== tag);
    this.selectedTags.set(updated);
    this.tagsChanged.emit(updated);
  }

  openDropdown(): void {
    this.loadTags(this.searchQuery());
    this.isOpen.set(true);
  }

  closeDropdown(): void {
    setTimeout(() => this.isOpen.set(false), 150);
  }

  private loadTags(search: string): void {
    this.tagsService.getSuggestedTags(search, 12).subscribe((tags: string[]) => {
      this.allTags.set(tags);
    });
  }
}
