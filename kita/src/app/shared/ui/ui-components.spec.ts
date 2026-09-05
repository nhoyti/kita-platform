import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button/button.component';
import { CardComponent } from './card/card.component';
import { InputComponent } from './input/input.component';
import { LoadingComponent } from './loading/loading.component';
import { ModalComponent } from './modal/modal.component';

@Component({
  imports: [ButtonComponent, CardComponent, InputComponent, LoadingComponent, ModalComponent],
  template: `
    <app-button [loading]="buttonLoading">Continue</app-button>
    <app-input id="email" label="Email" [(value)]="email" [error]="inputError" />
    <app-card>Card content</app-card>
    <app-loading label="Loading profile" />
    <app-modal [open]="modalOpen" title="Test dialog" (closed)="modalClosed = true" />
  `,
})
class UiComponentsHost {
  buttonLoading = true;
  email = '';
  inputError = 'Email is required';
  modalOpen = true;
  modalClosed = false;
}

describe('shared UI components', () => {
  let fixture: ComponentFixture<UiComponentsHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UiComponentsHost] }).compileComponents();
    fixture = TestBed.createComponent(UiComponentsHost);
    fixture.detectChanges();
  });

  it('renders loading, validation, card, and button states', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('button')?.disabled).toBe(true);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Loading profile');
    expect(element.querySelector('app-card')?.textContent).toContain('Card content');
    expect(element.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#email-error')?.textContent).toContain('Email is required');
  });

  it('emits when the modal is closed with Escape', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(fixture.componentInstance.modalClosed).toBe(true);
  });
});
