import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SanitizeHtmlService {
  private readonly sanitizer = inject(DomSanitizer);

  sanitize(html: string): SafeHtml {
    if (!html) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    const sanitized = this.removeDangerousContent(html);
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  private removeDangerousContent(html: string): string {
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '');

    const allowedTags = [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'span',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code'
    ];

    const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    sanitized = sanitized.replace(tagPattern, (match, tagName) => {
      const lowerTag = tagName.toLowerCase();
      if (allowedTags.includes(lowerTag)) {
        if (lowerTag === 'a') {
          if (!match.includes('rel=')) {
            return match.replace('>', ' rel="noopener noreferrer">');
          }
        }
        return match;
      }
      if (match.startsWith('</')) {
        return '';
      }
      return '';
    });

    return sanitized;
  }
}