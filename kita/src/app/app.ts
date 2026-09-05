import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppShellComponent } from './core/layout/app-shell.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
