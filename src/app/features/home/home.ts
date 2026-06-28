import { Component } from '@angular/core';
import { Collaboration } from './components/collaboration/collaboration';
import { CtaBanner } from './components/cta-banner/cta-banner';
import { FeatureCards } from './components/feature-cards/feature-cards';
import { Hero } from './components/hero/hero';
import { Stats } from './components/stats/stats';
import { Testimonials } from './components/testimonials/testimonials';
import { TrustBadges } from './components/trust-badges/trust-badges';

@Component({
  selector: 'app-home',
  imports: [Hero, TrustBadges, Collaboration, FeatureCards, Stats, Testimonials, CtaBanner],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
