# Copilot Custom Instructions for Nexora Frontend

Always follow the standards defined in `GEMINI.md` within this repository.

Key constraints:
- Angular version: Modern (v17+).
- Syntax: Use @if/@for/@switch instead of *ngIf/*ngFor.
- Reactivity: Use Angular Signals.
- Code length: Maximum 200 lines per TypeScript file.
- Structure: Component-per-folder with TS, HTML, and CSS files.
- Styling: Use :host { display: block; } in all component styles.

UI/UX & Mobile-First Excellence:
- Conceptualize and implement for mobile devices first.
- Ensure touch targets are at least 44x44px.
- Use smooth transitions and entrance animations.
- Adhere to the "Editorial Dark Mode" visual identity (UTP Red #df3432 accent).
