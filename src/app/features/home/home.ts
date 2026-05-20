import { Component } from '@angular/core';
import { Collaboration } from './components/collaboration/collaboration';
import { CtaBanner } from './components/cta-banner/cta-banner';
import { Hero } from './components/hero/hero';
import { Stats } from './components/stats/stats';
import { Testimonials } from './components/testimonials/testimonials';
import { ShellLayout } from '../../shared/components/shell-layout/shell-layout';
import { FeedTrends } from '../feed/components/feed-trends/feed-trends';

@Component({
  selector: 'app-home',
  imports: [Hero, Collaboration, Stats, Testimonials, CtaBanner, ShellLayout, FeedTrends],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
