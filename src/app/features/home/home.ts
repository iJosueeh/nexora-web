import { Component } from '@angular/core';
import { Collaboration } from './components/collaboration/collaboration';
import { CtaBanner } from './components/cta-banner/cta-banner';
import { Hero } from './components/hero/hero';
import { HomeSidebarComponent } from './components/home-sidebar/home-sidebar.component';
import { Stats } from './components/stats/stats';
import { Testimonials } from './components/testimonials/testimonials';

@Component({
  selector: 'app-home',
  imports: [Hero, Collaboration, Stats, Testimonials, CtaBanner, HomeSidebarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
