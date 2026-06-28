import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, inject, input, output, signal, ViewChild, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

import { TiptapEditorDirective } from 'ngx-tiptap';
import { EmojiData, emojiCategories, quickEmojis, searchEmojis } from './emoji-data';

const MOBILE_BREAKPOINT = 640;

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, TiptapEditorDirective],
  templateUrl: './rich-text-editor.html',
  styleUrl: './rich-text-editor.css'
})
export class RichTextEditorComponent implements OnInit, OnDestroy {
  readonly content = input<string>('');
  readonly contentChange = output<string>();
  readonly pasteWithImages = output<File[]>();

  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('emojiBtn') emojiBtnRef!: ElementRef<HTMLButtonElement>;

  readonly editor = signal<Editor | null>(null);
  readonly showEmojiPicker = signal(false);
  readonly emojiSearchQuery = signal('');
  readonly emojiSearchResults = signal<EmojiData[]>([]);
  readonly showLinkInput = signal(false);
  readonly linkUrl = signal('');

  readonly emojiPickerTop = signal(0);
  readonly emojiPickerLeft = signal(0);

  readonly isBoldActive = signal(false);
  readonly isItalicActive = signal(false);
  readonly isLinkActive = signal(false);

  readonly isMobile = signal(false);

  readonly quickEmojis = quickEmojis;
  readonly emojiCategories = emojiCategories;
  readonly activeEmojiCategory = signal<string>('Caras');

  readonly extensions = [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      strike: false,
    }),
    Placeholder.configure({
      placeholder: '¿Qué quieres compartir con tu comunidad?',
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-[#df3432] underline hover:text-[#ff4652]',
      },
    }),
  ];

  ngOnInit(): void {
    this.checkMobile();
    window.addEventListener('resize', this._onResize);

    if (!this.isMobile()) {
      this.initEditor();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this._onResize);
    this.editor()?.destroy();
  }

  private readonly _onResize = (): void => {
    const wasMobile = this.isMobile();
    this.checkMobile();

    if (wasMobile !== this.isMobile()) {
      if (this.isMobile()) {
        this.editor()?.destroy();
        this.editor.set(null);
      } else {
        this.initEditor();
      }
      this.cdr.markForCheck();
    }
  };

  private checkMobile(): void {
    this.isMobile.set(window.innerWidth < MOBILE_BREAKPOINT);
  }

  private initEditor(): void {
    const e = new Editor({
      extensions: this.extensions,
      content: this.content(),
      onUpdate: ({ editor }) => {
        this.contentChange.emit(editor.getHTML());
      },
      onTransaction: () => {
        this._syncActiveStates();
        this.cdr.markForCheck();
      },
      editorProps: {
        handlePaste: (_view, event) => {
          const clipboardData = event.clipboardData;
          if (!clipboardData) return false;

          const items = clipboardData.items;
          const files: File[] = [];

          for (const item of items) {
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                files.push(file);
              }
            }
          }

          if (files.length > 0) {
            this.pasteWithImages.emit(files);
            return true;
          }

          return false;
        },
      },
    });
    this.editor.set(e);
  }

  private _syncActiveStates(): void {
    const e = this.editor();
    if (!e) return;
    this.isBoldActive.set(e.isActive('bold'));
    this.isItalicActive.set(e.isActive('italic'));
    this.isLinkActive.set(e.isActive('link'));
  }

  /* ─── Mobile textarea ─── */

  onMobileInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.contentChange.emit(target.value);
  }

  /* ─── Desktop toolbar ─── */

  toggleBold(): void {
    this.editor()?.chain().focus().toggleBold().run();
    this._syncActiveStates();
    this.cdr.markForCheck();
  }

  toggleItalic(): void {
    this.editor()?.chain().focus().toggleItalic().run();
    this._syncActiveStates();
    this.cdr.markForCheck();
  }

  toggleLink(): void {
    const e = this.editor();
    if (!e) return;
    if (e.isActive('link')) {
      e.chain().focus().unsetLink().run();
      this._syncActiveStates();
      this.cdr.markForCheck();
    } else {
      this.showLinkInput.set(true);
      this.linkUrl.set('');
    }
  }

  confirmLink(): void {
    const url = this.linkUrl().trim();
    if (url) {
      const href = url.startsWith('http') ? url : `https://${url}`;
      this.editor()?.chain().focus().setLink({ href }).run();
    }
    this.showLinkInput.set(false);
    this.linkUrl.set('');
    this._syncActiveStates();
    this.cdr.markForCheck();
  }

  cancelLink(): void {
    this.showLinkInput.set(false);
    this.linkUrl.set('');
  }

  onLinkUrlChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.linkUrl.set(target?.value ?? '');
  }

  toggleEmojiPicker(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.showEmojiPicker()) {
      const btn = this.emojiBtnRef?.nativeElement;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        this.emojiPickerTop.set(rect.bottom + 4);
        this.emojiPickerLeft.set(rect.left);
      }
    }

    this.showEmojiPicker.update(v => !v);

    if (!this.showEmojiPicker()) {
      this.emojiSearchQuery.set('');
      this.emojiSearchResults.set([]);
    }
  }

  onEmojiSearch(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const query = target?.value ?? '';
    this.emojiSearchQuery.set(query);

    if (query.length >= 2) {
      const results = searchEmojis(query);
      this.emojiSearchResults.set(results);
    } else {
      this.emojiSearchResults.set([]);
    }
  }

  addEmoji(emoji: string): void {
    this.editor()?.chain().focus().insertContent(emoji).run();
    this.showEmojiPicker.set(false);
    this.emojiSearchQuery.set('');
    this.emojiSearchResults.set([]);
    this.editor()?.commands.focus();
    this._syncActiveStates();
    this.cdr.markForCheck();
  }

  selectEmojiCategory(categoryName: string): void {
    this.activeEmojiCategory.set(categoryName);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showEmojiPicker()) {
      const target = event.target as HTMLElement;
      if (!target.closest('.emoji-picker-panel') && !this.emojiBtnRef?.nativeElement?.contains(target)) {
        this.showEmojiPicker.set(false);
        this.emojiSearchQuery.set('');
        this.emojiSearchResults.set([]);
      }
    }
  }
}
