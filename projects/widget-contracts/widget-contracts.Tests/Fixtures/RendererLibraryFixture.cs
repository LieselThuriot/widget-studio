using WidgetStudio.Contracts.Tests.Hosts;

namespace WidgetStudio.Contracts.Tests.Fixtures;

public sealed class RendererLibraryFixture : IAsyncLifetime
{
    public string RepositoryRoot { get; private set; } = string.Empty;

    public async ValueTask InitializeAsync()
    {
        RepositoryRoot = NpmRendererTestHost.FindRepositoryRoot();
        await NpmRendererTestHost.BuildAsync(RepositoryRoot);
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;
}