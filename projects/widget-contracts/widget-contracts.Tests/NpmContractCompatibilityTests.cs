using System.Text.Json;

using WidgetStudio.Contracts.Elements;
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
            Id = "empty-widget",
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

    [Theory]
    [InlineData("complete")]
    [InlineData("minimal-text")]
    [InlineData("special-characters")]
    public async Task FingerprintMatchesNpmRendererLibrary(string variant)
    {
        var widget = ContractFixtures.CreateCompleteWidget();
        switch (variant)
        {
            case "minimal-text":
                var text = widget.Elements.OfType<TextElement>().First();
                text.Style.Padding = null;
                text.Style.Font.Bold = null;
                text.Style.Background = null;
                text.Text = "";
                widget.Refresh = null;
                widget.Background.Color = "#ABCDEF";
                widget.Rows = [GridTrack.Star(0.333333333), GridTrack.Pixel(1e-7), GridTrack.Pixel(1e15)];
                break;
            case "special-characters":
                widget.Elements.OfType<ImageElement>().First().Source =
                  "https://example.test/\"\u00fcn\u00ef\\c\u00f8d\u00e9\U0001F600\".png?q=\u0001";
                break;
        }

        var json = JsonSerializer.Serialize(widget, WidgetJsonContext.Default.WidgetContract);
        var result = await NpmRendererTestHost.ValidateAsync(fixture.RepositoryRoot, json);

        Assert.True(result.Success, result.Issues);
        Assert.Equal(WidgetFingerprint.Compute(widget), result.Fingerprint);
    }
}
