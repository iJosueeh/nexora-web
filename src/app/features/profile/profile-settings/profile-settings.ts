import { ChangeDetectionStrategy, Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

import { ShellLayout } from '../../../shared/components/shell-layout/shell-layout';
import { FeedSidebar } from '../../feed/components/feed-sidebar/feed-sidebar';
import { AuthSession } from '../../../core/services/auth-session';
import { SupabaseStorageService } from '../../../core/services/supabase-storage.service';
import { UPDATE_PROFILE_MUTATION } from '../../../graphql/graphql.queries';
import { AuthApiService } from '../../auth/services/auth-api.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShellLayout, FeedSidebar],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSession);
  private readonly apollo = inject(Apollo);
  private readonly storageService = inject(SupabaseStorageService);
  private readonly toastr = inject(ToastrService);
  private readonly authApi = inject(AuthApiService);

  readonly user = computed(() => this.authSession.getUser());
  readonly isSaving = signal(false);
  readonly previewAvatar = signal<string | null>(null);
  readonly previewBanner = signal<string | null>(null);
  readonly interestOptions = signal<string[]>([]);
  readonly careerOptions = signal<string[]>([]);

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    bio: [''],
    avatarUrl: [''],
    bannerUrl: [''],
    career: [''],
    academicInterests: [[] as string[]]
  });

  constructor() {
    this.loadCatalogs();

    // Sincronizar el formulario cuando el usuario cambie o se cargue la sesión
    effect(() => {
      const userData = this.user();
      if (userData) {
        this.form.patchValue({
          fullName: userData.fullName || '',
          username: userData.username || '',
          bio: userData.bio || '',
          avatarUrl: userData.avatarUrl || '',
          bannerUrl: userData.bannerUrl || '',
          career: userData.career || '',
          academicInterests: userData.academicInterests || []
        }, { emitEvent: false });
      }
    });
  }

  async loadCatalogs(): Promise<void> {
    try {
      const catalogs: any = await firstValueFrom(this.authApi.getRegistrationCatalogs());
      if (catalogs.careers) this.careerOptions.set(catalogs.careers);
      if (catalogs.academicInterests) this.interestOptions.set(catalogs.academicInterests);
    } catch (e) {
      console.error('Error loading catalogs', e);
    }
  }

  toggleInterest(interest: string): void {
    const current = this.form.value.academicInterests || [];
    const index = current.indexOf(interest);
    if (index === -1) {
      this.form.patchValue({ academicInterests: [...current, interest] });
    } else {
      this.form.patchValue({ academicInterests: current.filter(i => i !== interest) });
    }
  }

  isInterestSelected(interest: string): boolean {
    return (this.form.value.academicInterests || []).includes(interest);
  }

  async onFileSelected(event: Event, type: 'avatar' | 'banner'): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'avatar') this.previewAvatar.set(reader.result as string);
      else this.previewBanner.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const bucket = type === 'avatar' ? 'nexora-avatars' : 'nexora-posts';
      const fileExt = file.name.split('.').pop() || 'jpg';
      const path = `${this.user()?.id}/${type}-${crypto.randomUUID()}.${fileExt}`;
      const url = await this.storageService.uploadFile(bucket, path, file);
      
      if (type === 'avatar') this.form.patchValue({ avatarUrl: url });
      else this.form.patchValue({ bannerUrl: url });
    } catch (e) {
      this.toastr.error(`Error al subir ${type === 'avatar' ? 'el avatar' : 'la portada'}`);
    }
  }

  removeFile(type: 'avatar' | 'banner'): void {
    if (type === 'avatar') {
      this.previewAvatar.set(null);
      this.form.patchValue({ avatarUrl: '' });
    } else {
      this.previewBanner.set(null);
      this.form.patchValue({ bannerUrl: '' });
    }
  }

  cancel(): void {
    const username = this.user()?.username;
    if (username) {
      this.router.navigate(['/u', username]);
    } else {
      this.router.navigate(['/feed']);
    }
  }

  save(): void {
    if (this.form.invalid || this.isSaving()) {
      if (this.form.invalid) {
        this.toastr.warning('Por favor, completa los campos obligatorios correctamente.');
      }
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.value;

    this.apollo.mutate<any>({
      mutation: UPDATE_PROFILE_MUTATION,
      variables: {
        input: {
          username: formValue.username,
          fullName: formValue.fullName,
          bio: formValue.bio,
          career: formValue.career,
          avatarUrl: formValue.avatarUrl || null,
          bannerUrl: formValue.bannerUrl || null,
          academicInterests: formValue.academicInterests
        }
      }
    }).subscribe({
      next: (result) => {
        const updatedProfile = result.data.actualizarPerfil;
        this.authSession.mergeUser(updatedProfile);
        this.toastr.success('Perfil actualizado correctamente');
        this.isSaving.set(false);
      },
      error: (err) => {
        this.toastr.error('Error al actualizar el perfil');
        this.isSaving.set(false);
        console.error(err);
      }
    });
  }
}
