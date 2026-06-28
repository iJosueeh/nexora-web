import { Component, OnInit, inject, computed, effect } from '@angular/core';
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
