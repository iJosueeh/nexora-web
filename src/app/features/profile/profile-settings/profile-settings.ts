import { ChangeDetectionStrategy, Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
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
import { RegisterCatalogsResponse, UpdateProfileResponse } from '../../../interfaces/auth';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShellLayout, FeedSidebar],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerList', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.9)' }),
          stagger(30, [
            animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
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
  readonly isUploadingAvatar = signal(false);
  readonly isUploadingBanner = signal(false);
  readonly previewAvatar = signal<string | null>(null);
  readonly previewBanner = signal<string | null>(null);
  readonly interestOptions = signal<string[]>([]);
  readonly careerOptions = signal<string[]>([]);
  readonly interestSearchQuery = signal('');
  readonly selectedInterests = signal<string[]>([]);

  readonly filteredInterestOptions = computed(() => {
    const query = this.interestSearchQuery().toLowerCase().trim();
    const options = this.interestOptions();
    if (!query) return options.slice(0, 15);
    return options.filter(opt => opt.toLowerCase().includes(query));
  });

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    bio: [''],
    avatarUrl: [''],
    bannerUrl: [''],
    career: ['']
  });

  constructor() {
    this.loadCatalogs();

    effect(() => {
      const userData = this.user();
      if (userData) {
        this.form.patchValue({
          fullName: userData.fullName || '',
          username: userData.username || '',
          bio: userData.bio || '',
          avatarUrl: userData.avatarUrl || '',
          bannerUrl: userData.bannerUrl || '',
          career: userData.career || ''
        }, { emitEvent: false });
        this.selectedInterests.set(userData.academicInterests || []);
      }
    });
  }

  async loadCatalogs(): Promise<void> {
    try {
      const catalogs: RegisterCatalogsResponse = await firstValueFrom(this.authApi.getRegistrationCatalogs());
      if (catalogs.careers) this.careerOptions.set(catalogs.careers);
      if (catalogs.academicInterests) this.interestOptions.set(catalogs.academicInterests);
    } catch (e) {
      console.error('Error loading catalogs', e);
    }
  }

  toggleInterest(interest: string): void {
    const current = this.selectedInterests();
    if (current.includes(interest)) {
      this.selectedInterests.set(current.filter(i => i !== interest));
    } else {
      this.selectedInterests.set([...current, interest]);
    }
  }

  isInterestSelected(interest: string): boolean {
    return this.selectedInterests().includes(interest);
  }

  async onFileSelected(event: Event, type: 'avatar' | 'banner'): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (type === 'avatar') this.isUploadingAvatar.set(true);
    else this.isUploadingBanner.set(true);

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

      if (type === 'avatar') {
        this.form.patchValue({ avatarUrl: url });
        this.isUploadingAvatar.set(false);
      } else {
        this.form.patchValue({ bannerUrl: url });
        this.isUploadingBanner.set(false);
      }
    } catch (e) {
      this.isUploadingAvatar.set(false);
      this.isUploadingBanner.set(false);
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

    this.apollo.mutate<UpdateProfileResponse>({
      mutation: UPDATE_PROFILE_MUTATION,
      variables: {
        input: {
          username: formValue.username,
          fullName: formValue.fullName,
          bio: formValue.bio,
          career: formValue.career,
          avatarUrl: formValue.avatarUrl || null,
          bannerUrl: formValue.bannerUrl || null,
          academicInterests: this.selectedInterests()
        }
      }
    }).subscribe({
      next: (result) => {
        const updatedProfile = result.data?.actualizarPerfil;
        if (updatedProfile) this.authSession.mergeUser(updatedProfile);
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