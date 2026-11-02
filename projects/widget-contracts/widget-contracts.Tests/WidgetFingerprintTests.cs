using System.Text.Json;

using WidgetStudio.Contracts.Data;
using WidgetStudio.Contracts.Elements;
using WidgetStudio.Contracts.Elements.Charts;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Tests;

public sealed class WidgetFingerprintTests
{
    private static readonly string Baseline = WidgetFingerprint.Compute(ContractFixtures.CreateCompleteWidget())!;

    [Fact]
    public void FingerprintIsVersionedSha256() =>
        Assert.Matches("^wfp:1:[0-9a-f]{64}$", Baseline);

    [Fact]
    public void ContentChangesKeepTheFingerprint()
    {
        var widget = ContractFixtures.CreateCompleteWidget();
        widget.Id = "another-widget";
        widget.Refresh!.Label = "Something else";
        Element<TextElement>(widget).Text = "Hi, visitor";
        Element<ImageElement>(widget).Alt = "Different alt";
        var button = Element<ButtonElement>(widget);
        button.Label = "Send";
        button.Url = "/elsewhere";
        button.Body = null;
        var pie = Element<PieElement>(widget);
        pie.Title = "Other title";
        pie.Data = [new ChartDataPoint { Label = "X", Value = 9 }, new ChartDataPoint { Label = "Y", Value = 1, Color = "#fff" }];
        Element<GaugeElement>(widget).Data = new GaugeData { Value = 1, Min = -5, Max = 5 };
        Element<ProgressElement>(widget).Data = new ProgressData { Min = 0, Max = 10, Items = [] };

        Assert.Equal(Baseline, WidgetFingerprint.Compute(widget));
    }

    [Fact]
    public void LookChangesChangeTheFingerprint()
    {
        Assert.NotEqual(Baseline, Mutate(widget => Element<TextElement>(widget).Style.Color = "#000001"));
        Assert.NotEqual(Baseline, Mutate(widget => Element<TextElement>(widget).Text = " "));
        Assert.NotEqual(Baseline, Mutate(widget => Element<ImageElement>(widget).Source = "other.png"));
        Assert.NotEqual(Baseline, Mutate(widget => widget.Background.Image = null));
        Assert.NotEqual(Baseline, Mutate(widget => Element<ButtonElement>(widget).Method = Enums.ButtonMethod.Get));
        Assert.NotEqual(Baseline, Mutate(widget => Element<FunnelElement>(widget).Title = "Now titled"));
        Assert.NotEqual(Baseline, Mutate(widget => widget.Elements[0].Grid.Row = 3));
        Assert.NotEqual(Baseline, Mutate(widget => widget.Size = Enums.WidgetSize.Square));
        Assert.NotEqual(Baseline, Mutate(widget => widget.Elements.Reverse()));
    }

    [Fact]
    public void ColorCaseAndDefaultsDoNotChangeTheFingerprint()
    {
        Assert.Equal(Baseline, Mutate(widget => Element<TextElement>(widget).Style.Color = "#FFFFFF"));

        var withDefaults = ContractFixtures.CreateCompleteWidget();
        var text = Element<TextElement>(withDefaults);
        text.Style.Padding = null;
        text.Style.Font.Italic = null;
        var explicitDefaults = ContractFixtures.CreateCompleteWidget();
        var explicitText = Element<TextElement>(explicitDefaults);
        explicitText.Style.Padding = new TextPadding { Vertical = 0, Horizontal = 0 };
        explicitText.Style.Font.Italic = false;

        Assert.Equal(WidgetFingerprint.Compute(explicitDefaults), WidgetFingerprint.Compute(withDefaults));
    }

    [Fact]
    public void InvalidWidgetsHaveNoFingerprint()
    {
        Assert.Null(WidgetFingerprint.Compute((WidgetContract?)null));
        Assert.Null(WidgetFingerprint.Compute("not json"));
        Assert.Null(Mutate(widget => widget.Rows = []));
    }

    [Fact]
    public void ContractShorthandMatchesStaticCompute() =>
        Assert.Equal(Baseline, ContractFixtures.CreateCompleteWidget().ComputeFingerprint());

    [Fact]
    public void JsonOverloadMatchesContractOverload() =>
        Assert.Equal(
          Baseline,
          WidgetFingerprint.Compute(JsonSerializer.Serialize(ContractFixtures.CreateCompleteWidget(), WidgetJsonContext.Default.WidgetContract)));

    private static string? Mutate(Action<WidgetContract> mutate)
    {
        var widget = ContractFixtures.CreateCompleteWidget();
        mutate(widget);
        return WidgetFingerprint.Compute(widget);
    }

    private static T Element<T>(WidgetContract widget) where T : WidgetElement =>
        widget.Elements.OfType<T>().First();
}
