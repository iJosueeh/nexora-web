import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { ManagementService } from '../../services/management.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { UserProfile } from '../../models/admin-dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardView implements OnInit {
  private readonly managementService = inject(ManagementService);

  readonly stats = this.managementService.stats;
  readonly loading = this.managementService.loading;

  // Promote modal state
  showPromoteModal = signal(false);
  promoteSearch = signal('');
  selectedUser = signal<UserProfile | null>(null);
  selectedRole = signal<string>('ROLE_ADMIN');
  promoteLoading = signal(false);
  promoteSearching = signal(false);

  readonly roles = [
    { value: 'ROLE_ADMIN', label: 'Administrador' },
    { value: 'ROLE_OFFICIAL', label: 'Cuenta Oficial' },
    { value: 'ROLE_STUDENT', label: 'Estudiante' },
  ];

  // Results derived from users signal + current search
  readonly promoteResults = computed(() => {
    const q = this.promoteSearch().toLowerCase();
    return this.managementService.users()
      .filter(u =>
        !q ||
        u.username?.toLowerCase().includes(q) ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  });

  openPromoteModal(): void {
    this.managementService.resetUsers();
    this.showPromoteModal.set(true);
    this.promoteSearch.set('');
    this.selectedUser.set(null);
    this.selectedRole.set('ROLE_ADMIN');
  }

  closePromoteModal(): void {
    this.showPromoteModal.set(false);
  }

  searchPromoteUsers(): void {
    const q = this.promoteSearch();
    if (q.length < 2) { return; }
    this.promoteSearching.set(true);
    this.managementService.loadUsers(10, 0, false, q).subscribe({
      complete: () => this.promoteSearching.set(false),
      error: () => this.promoteSearching.set(false),
    });
  }

  selectUserForPromote(user: UserProfile): void {
    this.selectedUser.set(user);
  }

  confirmPromote(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.promoteLoading.set(true);
    this.managementService.promoteUser(user.id, this.selectedRole()).subscribe({
      next: () => {
        this.promoteLoading.set(false);
        this.closePromoteModal();
      },
      error: () => this.promoteLoading.set(false),
    });
  }

  downloadReport(): void {
    const s = this.stats();
    const doc = new jsPDF();

    // Header
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(227, 38, 46);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('NEXORA', 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte de Estadisticas - Dashboard', 20, 30);
    doc.setFontSize(8);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 20, 37);

    // KPIs
    let y = 55;
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen General', 20, y);
    y += 8;

    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(227, 38, 46);
    doc.text(String(s?.totalUsers ?? 0), 20, y + 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Total Usuarios', 20, y + 20);

    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(String(s?.totalPosts ?? 0), 70, y + 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Publicaciones', 70, y + 20);

    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text(String(s?.activeEvents ?? 0), 120, y + 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Eventos Activos', 120, y + 20);

    y += 35;

    // Crecimiento
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('Crecimiento de Usuarios', 20, y);
    y += 8;

    const growth = s?.userGrowth ?? [];
    const colW = Math.min(160 / Math.max(growth.length, 1), 40);
    growth.forEach((m, i) => {
      const x = 20 + i * colW;
      doc.setFillColor(227, 38, 46);
      const barH = Math.max((m.value / Math.max(...growth.map(g => g.value), 1)) * 30, 2);
      doc.rect(x, y + 28 - barH, colW - 4, barH, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(String(m.value), x + colW / 2 - 3, y + 32);
      doc.setFontSize(6);
      doc.text(m.label.substring(0, 8), x + colW / 2 - 6, y + 38);
    });

    y += 50;

    // Carreras
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('Distribucion por Carrera', 20, y);
    y += 8;

    doc.setFillColor(240, 240, 240);
    doc.rect(20, y, 160, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('Carrera', 22, y + 4.5);
    doc.text('Cantidad', 140, y + 4.5);
    doc.text('%', 175, y + 4.5);
    y += 8;

    const careers = s?.careerDistribution ?? [];
    const total = careers.reduce((sum, c) => sum + c.count, 0);
    careers.forEach((c, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(20, y - 3, 160, 7, 'F');
      }
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(c.category, 22, y + 1.5);
      doc.text(String(c.count), 142, y + 1.5);
      doc.text(total > 0 ? ((c.count / total) * 100).toFixed(1) + '%' : '0%', 175, y + 1.5);
      y += 7;
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text('NEXORA Hub - Panel de Administracion', 20, 285);
    doc.text('Pagina 1 de 1', 160, 285);

    doc.save('nexora-report.pdf');
  }

  // Chart Data as Computed Signals
  readonly lineChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const s = this.stats();
    if (!s) return { labels: [], datasets: [] };

    return {
      labels: s.userGrowth.map(m => m.label),
      datasets: [
        {
          data: s.userGrowth.map(m => m.value),
          label: 'Usuarios Totales',
          fill: true,
          tension: 0.4,
          borderColor: '#e3262e',
          backgroundColor: 'rgba(227, 38, 46, 0.1)',
          pointBackgroundColor: '#e3262e',
        }
      ]
    };
  });

  readonly pieChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const s = this.stats();
    if (!s || !s.careerDistribution.length) {
       return { labels: ['Sin Datos'], datasets: [{ data: [1], backgroundColor: ['#1d2432'] }] };
    }

    return {
      labels: s.careerDistribution.map(m => m.category),
      datasets: [{
        data: s.careerDistribution.map(m => m.count),
        backgroundColor: ['#e3262e', '#1d2432', '#9aa3b2', '#4c566a', '#3b4252'],
        hoverBackgroundColor: ['#f02d36', '#2a3447', '#cbd5e1', '#5e6a7c', '#434c5e'],
        borderWidth: 0
      }]
    };
  });

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#9aa3b2' } } }
  };

  public pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { position: 'bottom', labels: { color: '#9aa3b2', padding: 20 } } }
  };

  ngOnInit(): void {
    this.managementService.loadDashboardStats();
  }
}
