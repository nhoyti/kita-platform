import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="grid gap-2 text-sm font-semibold text-emerald-950" [for]="id()">
      {{ label() }}
      <input
        class="min-h-12 rounded-xl border border-emerald-900/15 bg-white px-4 text-base font-normal text-emerald-950 outline-none transition placeholder:text-emerald-950/40 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-900/10"
        [id]="id()"
        [name]="id()"
        [placeholder]="placeholder()"
        [type]="type()"
        [value]="value()"
        (input)="onInput($event)"
      />
    </label>
  `,
})
export class InputComponent {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly value = model('');

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
