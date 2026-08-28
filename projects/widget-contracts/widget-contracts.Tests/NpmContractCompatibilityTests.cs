using System.Text.Json;

using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Tests.Fixtures;
using WidgetStudio.Contracts.Tests.Hosts;

namespace WidgetStudio.Contracts.Tests;

public sealed class NpmContractCompatibilityTests(RendererLibraryFixture fixture) : IClassFixture<RendererLibraryFixture>
{
    [Fact]
    public async Task WidgetIsAcceptedByBuiltNpmRendererLibrary()
    {
        var json = JsonSerializer.Serialize(ContractFixtures.CreateCompleteWidget(), WidgetJsonContext.Default.WidgetContract);
        var result = await NpmRendererTestHost.ValidateAsync(fixture.RepositoryRoot, json);

        Assert.True(
          result.Success,
          $"widget-renderer rejected the C# serialized contract: {result.Issues}");
    }

    [Fact]
    public async Task EmptyWidgetReturnsValidationIssuesFromNpmRendererLibrary()
    {
        var widget = new WidgetContract
        {
            Size = WidgetSize.Square,
            Rows = [],
            Columns = [],
            Background = new BackgroundConfig
            {
                Sensitive = false,
                Repeat = false,
                Size = BackgroundSize.Auto,
                Anchor = ElementAnchor.Center
            },
            Elements = []
        };
        var json = JsonSerializer.Serialize(widget, WidgetJsonContext.Default.WidgetContract);
        var result = await NpmRendererTestHost.ValidateAsync(fixture.RepositoryRoot, json);

        Assert.False(result.Success, "The renderer accepted a widget with no grid tracks.");
        Assert.Contains("\"path\":\"rows\"", result.Issues, StringComparison.Ordinal);
        Assert.Contains("\"path\":\"columns\"", result.Issues, StringComparison.Ordinal);
    }
}