import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementService } from '../../services/management.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardView implements OnInit {
  private readonly managementService = inject(ManagementService);
  
  readonly stats = this.managementService.stats;
  readonly loading = this.managementService.loading;

  // Configuración de Gráfico de Líneas (Crecimiento)
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55],
        label: 'Nuevos Usuarios',
        fill: true,
        tension: 0.4,
        borderColor: '#e3262e',
        backgroundColor: 'rgba(227, 38, 46, 0.1)',
        pointBackgroundColor: '#e3262e',
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { display: false },
      x: { 
        grid: { display: false },
        ticks: { color: '#9aa3b2' }
      }
    }
  };

  // Configuración de Gráfico de Pastel (Distribución)
  public pieChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Investigaciones', 'Eventos', 'Social'],
    datasets: [{
      data: [300, 150, 100],
      backgroundColor: ['#e3262e', '#1d2432', '#9aa3b2'],
      hoverBackgroundColor: ['#f02d36', '#2a3447', '#cbd5e1'],
      borderWidth: 0
    }]
  };

  public pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9aa3b2', padding: 20 } }
    }
  };

  ngOnInit(): void {
    this.managementService.loadDashboardStats();
  }
}
