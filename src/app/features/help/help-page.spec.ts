import { HelpPageBase } from './help-page';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

// Concrete implementation for testing logic only
class TestHelpPage extends HelpPageBase {}

describe('HelpPage Logic', () => {
  let component: TestHelpPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        TestHelpPage
      ]
    });

    component = TestBed.inject(TestHelpPage);
  });

  it('should be initialized', () => {
    expect(component).toBeTruthy();
  });

  it('should have FAQ as default tab', () => {
    expect(component.activeTab()).toBe('faq');
  });

  it('should switch tabs', () => {
    component.setTab('soporte');
    expect(component.activeTab()).toBe('soporte');
    
    component.setTab('faq');
    expect(component.activeTab()).toBe('faq');
  });

  it('should have a valid support form link', () => {
    expect(component.supportFormLink).toContain('forms.gle');
  });
});

