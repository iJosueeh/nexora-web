import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementService, Faculty, Course, AcademicInterest } from '../../services/management.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance.html',
  styleUrls: ['./maintenance.css']
})
export class MaintenancePage implements OnInit {
  private readonly managementService = inject(ManagementService);
  private readonly toast = inject(ToastService);

  readonly faculties = this.managementService.faculties;
  readonly courses = this.managementService.courses;
  readonly academicInterests = this.managementService.academicInterests;
  readonly loading = this.managementService.loading;

  activeTab = signal<'faculties' | 'courses' | 'interests'>('faculties');

  // Modal State
  isModalOpen = signal(false);
  modalMode = signal<'create' | 'edit' | 'delete'>('create');
  selectedItem = signal<Faculty | Course | AcademicInterest | null>(null);
  
  // Form values
  itemName = signal('');
  selectedFacultyId = signal('');

  ngOnInit() {
    this.managementService.loadCatalogs();
  }

  setTab(tab: 'faculties' | 'courses' | 'interests') {
    this.activeTab.set(tab);
  }

  openModal(mode: 'create' | 'edit', item?: Faculty | Course | AcademicInterest) {
    this.modalMode.set(mode);
    this.selectedItem.set(item || null);
    this.itemName.set(item?.name || '');
    this.selectedFacultyId.set(item && 'faculty' in item ? item.faculty.id : '');
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  save() {
    const mode = this.modalMode();
    const tab = this.activeTab();
    const name = this.itemName().trim();

    if (!name) return;

    if (tab === 'faculties') {
      if (mode === 'create') {
        this.managementService.createFaculty(name).subscribe({
          next: () => this.onSuccess('Facultad creada'),
          error: (err) => this.toast.show(err.message || 'Error al crear facultad', 'error')
        });
      } else {
        this.managementService.updateFaculty(this.selectedItem()!.id, name).subscribe({
          next: () => this.onSuccess('Facultad actualizada'),
          error: (err) => this.toast.show(err.message || 'Error al actualizar facultad', 'error')
        });
      }
    } else if (tab === 'courses') {
      const facultyId = this.selectedFacultyId();
      if (!facultyId) {
        this.toast.show('Por favor selecciona una facultad', 'warning');
        return;
      }
      if (mode === 'create') {
        this.managementService.createCourse(name, facultyId).subscribe({
          next: () => this.onSuccess('Carrera creada'),
          error: (err) => this.toast.show(err.message || 'Error al crear carrera', 'error')
        });
      } else {
        this.managementService.updateCourse(this.selectedItem()!.id, name, facultyId).subscribe({
          next: () => this.onSuccess('Carrera actualizada'),
          error: (err) => this.toast.show(err.message || 'Error al actualizar carrera', 'error')
        });
      }
    } else if (tab === 'interests') {
      if (mode === 'create') {
        this.managementService.createInterest(name).subscribe({
          next: () => this.onSuccess('Interés creado'),
          error: (err) => this.toast.show(err.message || 'Error al crear interés', 'error')
        });
      } else {
        this.managementService.updateInterest(this.selectedItem()!.id, name).subscribe({
          next: () => this.onSuccess('Interés actualizado'),
          error: (err) => this.toast.show(err.message || 'Error al actualizar interés', 'error')
        });
      }
    }
  }

  delete(item: Faculty | Course | AcademicInterest) {
    this.selectedItem.set(item);
    this.modalMode.set('delete');
    this.isModalOpen.set(true);
  }

  confirmDelete() {
    const item = this.selectedItem();
    if (!item) return;

    const tab = this.activeTab();
    if (tab === 'faculties') {
      this.managementService.deleteFaculty(item.id).subscribe({
        next: () => this.onSuccess('Facultad eliminada'),
        error: (err) => this.toast.show(err.message || 'Error al eliminar facultad', 'error')
      });
    } else if (tab === 'courses') {
      this.managementService.deleteCourse(item.id).subscribe({
        next: () => this.onSuccess('Carrera eliminada'),
        error: (err) => this.toast.show(err.message || 'Error al eliminar carrera', 'error')
      });
    } else if (tab === 'interests') {
      this.managementService.deleteInterest(item.id).subscribe({
        next: () => this.onSuccess('Interés eliminado'),
        error: (err) => this.toast.show(err.message || 'Error al eliminar interés', 'error')
      });
    }
  }

  private onSuccess(msg: string) {
    this.managementService.loadCatalogs();
    this.toast.show(msg, 'success');
    this.closeModal();
  }
}
