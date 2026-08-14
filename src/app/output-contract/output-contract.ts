import { Component, input } from '@angular/core';

@Component({
  selector: 'app-output-contract',
  template: `<section class="model-panel">
    <div class="model-heading">
      <div>
        <p class="eyebrow">Output contract</p>
        <h2>Widget model</h2>
      </div>
      <span class="json-badge">JSON</span>
    </div>
    <pre>{{ modelJson() }}</pre>
  </section>`,
  styles: `
    .model-panel {
      margin-top: 28px;
      padding: 20px 22px;
      background: #fff;
      border: 1px solid #e2e7f0;
      border-radius: 14px;
      box-shadow: 0 8px 24px #25365708;
    }
    .model-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .eyebrow {
      margin: 0;
      color: #8794ad;
      font:
        700 10px/1.2 'DM Sans',
        sans-serif;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }
    h2 {
      margin: 0;
      font:
        700 17px/1.1 'DM Sans',
        sans-serif;
    }
    .json-badge {
      border: 1px solid #d8deeb;
      border-radius: 5px;
      padding: 3px 6px;
      color: #71809b;
      font:
        700 10px 'DM Sans',
        sans-serif;
    }
    pre {
      max-height: 380px;
      overflow: auto;
      margin: 18px 0 0;
      padding: 18px;
      border-radius: 9px;
      background: #17233c;
      color: #b9c9e6;
      font:
        11px/1.65 'DM Mono',
        monospace;
    }
    @media (max-width: 700px) {
      pre {
        font-size: 9px;
      }
    }
  `,
})
export class OutputContract {
  readonly modelJson = input.required<string>();
}
