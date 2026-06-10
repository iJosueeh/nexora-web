import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

@Component({
  selector: 'app-publication-media-dropzone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publication-media-dropzone.html'
})
export class PublicationMediaDropzoneComponent {
  readonly filesSelected = output<File[]>();
  readonly uploadingChanged = output<boolean>();

  readonly files = signal<File[]>([]);
  readonly isDragging = signal(false);
  readonly isUploading = signal(false);

  readonly fileSummary = computed(() => {
    const total = this.files().length;
    return total === 0 ? 'Arrastra imágenes o documentos PDF aquí' : `${total} archivo${total === 1 ? '' : 's'} adjunto${total === 1 ? '' : 's'}`;
  });

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const droppedFiles = event.dataTransfer?.files ?? null;
    if (droppedFiles?.length) {
      this.simulateUpload(droppedFiles);
    }
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const selectedFiles = target?.files ?? null;
    if (selectedFiles?.length) {
      this.simulateUpload(selectedFiles);
    }
    if (target) {
      target.value = '';
    }
  }

  private simulateUpload(fileList: FileList): void {
    this.isUploading.set(true);
    this.uploadingChanged.emit(true);

    setTimeout(() => {
      const mergedFiles = [...this.files(), ...Array.from(fileList)];
      this.files.set(mergedFiles.slice(0, 6));
      this.filesSelected.emit(this.files());
      this.isUploading.set(false);
      this.uploadingChanged.emit(false);
    }, 2000);
  }

  removeFile(index: number): void {
    const nextFiles = this.files().filter((_, currentIndex) => currentIndex !== index);
    this.files.set(nextFiles);
    this.filesSelected.emit(nextFiles);
  }
}
