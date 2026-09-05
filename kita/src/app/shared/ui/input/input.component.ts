import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
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
        [disabled]="disabled() || disabledState()"
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
export class InputComponent implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly error = input('');
  readonly value = model('');
  protected readonly disabledState = signal(false);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }
}
