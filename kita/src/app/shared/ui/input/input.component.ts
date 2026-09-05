import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="grid gap-2 text-sm font-semibold text-emerald-950" [for]="id()">
      {{ label() }}
      <input
        class="min-h-12 rounded-xl border bg-white px-4 text-base font-normal text-emerald-950 outline-none transition placeholder:text-emerald-950/40 focus:ring-4 focus:ring-emerald-900/10"
        [class.border-red-600]="error()"
        [class.border-emerald-900/15]="!error()"
        [id]="id()"
        [name]="id()"
        [placeholder]="placeholder()"
        [type]="type()"
        [value]="value()"
        [required]="required()"
        [disabled]="disabled()"
        [attr.aria-describedby]="error() ? id() + '-error' : null"
        [attr.aria-invalid]="error() ? 'true' : 'false'"
        (input)="onInput($event)"
      />
      @if (error()) {
        <span class="text-xs font-normal text-red-700" [id]="id() + '-error'">{{ error() }}</span>
      }
    </label>
  `,
})
export class InputComponent {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly error = input('');
  readonly value = model('');

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
