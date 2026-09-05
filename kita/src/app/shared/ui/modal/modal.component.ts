import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 grid place-items-center bg-emerald-950/40 p-4"
        role="presentation"
        (click)="close()"
      >
        <div
          class="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId()"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-6 flex items-start justify-between gap-4">
            <h2 class="text-xl font-semibold text-emerald-950" [id]="titleId()">{{ title() }}</h2>
            <button
              class="grid size-9 place-items-center rounded-full text-xl text-emerald-950/60 hover:bg-emerald-900/5"
              type="button"
              aria-label="Close dialog"
              (click)="close()"
            >
              &times;
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly titleId = input('modal-title');
  readonly closed = output<void>();

  protected close(): void {
    this.closed.emit();
  }
}
