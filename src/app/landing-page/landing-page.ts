import { Component, input, output } from '@angular/core';
import { StudioHeader } from '../studio-header/studio-header';
import { RouterLink } from '@angular/router';

interface PublishedPackage {
  readonly name: string;
  readonly registry: 'npm' | 'NuGet';
  readonly description: string;
  readonly registryUrl: string;
  readonly docsUrl: string;
}

const repositoryUrl = 'https://github.com/LieselThuriot/widget-studio';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, StudioHeader],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  readonly darkMode = input(false);
  readonly darkModeToggled = output<void>();

  readonly repositoryUrl = repositoryUrl;
  readonly packages: readonly PublishedPackage[] = [
    {
      name: '@lieselthuriot/widget-renderer',
      registry: 'npm',
      description: 'Render widget contracts in any Angular application.',
      registryUrl: 'https://www.npmjs.com/package/@lieselthuriot/widget-renderer',
      docsUrl: `${repositoryUrl}/tree/main/projects/widget-renderer#readme`,
    },
    {
      name: '@lieselthuriot/widget-landscape',
      registry: 'npm',
      description: 'Arrange rendered widgets in a configurable dashboard grid.',
      registryUrl: 'https://www.npmjs.com/package/@lieselthuriot/widget-landscape',
      docsUrl: `${repositoryUrl}/tree/main/projects/widget-landscape#readme`,
    },
    {
      name: 'WidgetStudio.Contracts',
      registry: 'NuGet',
      description: 'Build and serialize the same widget JSON from .NET.',
      registryUrl: 'https://www.nuget.org/packages/WidgetStudio.Contracts',
      docsUrl: `${repositoryUrl}/tree/main/projects/widget-contracts/widget-contracts#readme`,
    },
  ];
}
