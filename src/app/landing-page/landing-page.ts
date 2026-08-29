import { Component, input, output } from '@angular/core';
import { StudioHeader } from '../studio-header/studio-header';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, StudioHeader],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  readonly darkMode = input(false);
  readonly darkModeToggled = output<void>();
}
