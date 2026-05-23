import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: Toast['type'] = 'info'): void {
    const id = Date.now();
    this.toastsSignal.update(t => [...t, { id, message, type }]);
    
    setTimeout(() => {
      this.toastsSignal.update(t => t.filter(toast => toast.id !== id));
    }, 5000);
  }
}
