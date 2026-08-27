using System.Text.Json;
using System.Text.Json.Nodes;
using WidgetStudio.Contracts.Data;
using WidgetStudio.Contracts.Elements;
using WidgetStudio.Contracts.Elements.Charts;
using WidgetStudio.Contracts.Enums;
using WidgetStudio.Contracts.Styles;

namespace WidgetStudio.Contracts.Tests;

internal static class ContractAssertions
{
  public static void AssertWireFormat(string json)
  {
    var root = JsonDocument.Parse(json).RootElement;
    Assert.Equal(2, root.GetProperty("version").GetInt32());
    Assert.Equal("wide", root.GetProperty("size").GetString());
    Assert.Equal(11, root.GetProperty("elements").GetArrayLength());
    Assert.DoesNotContain("Type", json, StringComparison.Ordinal);
    Assert.DoesNotContain("Kind", json, StringComparison.Ordinal);
  }

  public static void Equal(WidgetContract expected, WidgetContract actual)
  {
    Assert.Equal(expected.Version, actual.Version);
    Assert.Equal(expected.Size, actual.Size);
    Assert.Equal(
      expected.Rows.Select(track => (track.Size, track.Unit)),
      actual.Rows.Select(track => (track.Size, track.Unit)));
    Assert.Equal(
      expected.Columns.Select(track => (track.Size, track.Unit)),
      actual.Columns.Select(track => (track.Size, track.Unit)));
    Assert.Equal(expected.Background.Image, actual.Background.Image);
    Assert.Equal(expected.Background.Sensitive, actual.Background.Sensitive);
    Assert.Equal(expected.Background.Repeat, actual.Background.Repeat);
    Assert.Equal(expected.Background.Color, actual.Background.Color);
    Assert.Equal(expected.Background.Size, actual.Background.Size);
    Assert.Equal(expected.Background.Anchor, actual.Background.Anchor);
    Assert.Equal(expected.Background.OverlayColor, actual.Background.OverlayColor);
    Assert.Equal(expected.Refresh.Enabled, actual.Refresh.Enabled);
    Assert.Equal(expected.Refresh.Label, actual.Refresh.Label);
    var expectedJson = JsonSerializer.Serialize(expected, WidgetJsonContext.Default.WidgetContract);
    var actualJson = JsonSerializer.Serialize(actual, WidgetJsonContext.Default.WidgetContract);
    Assert.True(JsonNode.DeepEquals(JsonNode.Parse(expectedJson), JsonNode.Parse(actualJson)));
  }
}

internal static class ContractFixtures
{
  public static WidgetContract CreateCompleteWidget() => new()
  {
    Version = 2,
    Size = WidgetSize.Wide,
    Rows =
    [
      new GridTrack { Size = null, Unit = GridUnit.Auto },
      new GridTrack { Size = 2.5, Unit = GridUnit.Star }
    ],
    Columns =
    [
      new GridTrack { Size = 120, Unit = GridUnit.Pixel },
      new GridTrack { Size = 1, Unit = GridUnit.Star }
    ],
    Background = new BackgroundConfig
    {
      Image = "https://example.test/background.png",
      Sensitive = true,
      Repeat = true,
      Color = "#101820",
      Size = BackgroundSize.Cover,
      Anchor = ElementAnchor.BottomRight,
      OverlayColor = "#80000000"
    },
    Refresh = new RefreshConfig
    {
      Enabled = true,
      Label = "Reload data"
    },
    Elements =
    [
      new TextElement
      {
        Grid = Grid(0, 0),
        Sensitive = true,
        Text = "Hello",
        Style = new TextStyle
        {
          Color = "#ffffff",
          Font = new TextFontStyle
          {
            Size = 18,
            Bold = true,
            Italic = false,
            Underline = true,
            Strikethrough = false
          },
          Align = TextAlign.Center,
          Wrap = true,
          Background = "#000000",
          Radius = 4,
          Padding = new TextPadding { Vertical = 8, Horizontal = 12 }
        }
      },
      new ImageElement
      {
        Grid = Grid(0, 1),
        Source = "image.png",
        Alt = "An image",
        Fit = ImageFit.Contain,
        OverlayColor = "#40000000",
        Radius = 6
      },
      new ButtonElement
      {
        Grid = Grid(1, 0),
        Label = "Submit",
        Method = ButtonMethod.Post,
        Url = "/submit",
        Body = "{\"ok\":true}",
        RequestRefresh = true,
        ShowOnlyOnHover = false,
        Style = ButtonStyle.Outline
      },
      new DividerElement
      {
        Grid = Grid(1, 1),
        Orientation = DividerOrientation.Vertical,
        Style = new DividerStyle { Color = "#cccccc" }
      },
      new PieElement
      {
        Grid = Grid(2, 0),
        Title = "Pie",
        ShowLegend = true,
        Data = [new ChartDataPoint { Label = "A", Value = 1.5, Color = "#f00" }],
        Style = new ChartStyle
        {
          Color = new ChartColor { Legend = "#111", Title = "#222" },
          Font = new ChartFontStyle { Size = 11 }
        }
      },
      new DonutElement
      {
        Grid = Grid(2, 1),
        Title = "Donut",
        ShowLegend = false,
        Data = [new ChartDataPoint { Label = "B", Value = 2, Color = "#123456" }],
        Style = new ChartStyle
        {
          Color = new ChartColor { Legend = "#333", Title = "#444" },
          Font = new ChartFontStyle { Size = 12 }
        }
      },
      new FunnelElement
      {
        Grid = Grid(3, 0),
        ShowLegend = true,
        Data = [new ChartDataPoint { Label = "C", Value = 3, Color = "#00f" }],
        Style = new ChartStyle
        {
          Color = new ChartColor { Legend = "#555", Title = "#666" },
          Font = new ChartFontStyle { Size = 13 }
        }
      },
      new GaugeElement
      {
        Grid = Grid(3, 1),
        Title = "Gauge",
        ShowLegend = true,
        Data = new GaugeData { Value = 6, Min = 0, Max = 10 },
        Style = new ValueChartStyle
        {
          Color = new ValueChartColor
          {
            Legend = "#777",
            Fill = "#888",
            Track = "#999",
            Title = "#aaa"
          },
          Font = new ChartFontStyle { Size = 14 }
        }
      },
      new BarElement
      {
        Grid = Grid(4, 0),
        Title = "Bar",
        ShowLegend = true,
        Data = [new ChartDataPoint { Label = "D", Value = 4, Color = "#0f0" }],
        Style = AxisStyle()
      },
      new LineElement
      {
        Grid = Grid(4, 1),
        Title = "Line",
        Data = [new ChartDataPoint { Label = "E", Value = 5, Color = "#f0f" }],
        Style = AxisStyle()
      },
      new ProgressElement
      {
        Grid = Grid(5, 0),
        Title = "Progress",
        ShowLegend = true,
        Data = new ProgressData
        {
          Min = 0,
          Max = 100,
          Items =
          [
            new ProgressSegment { Value = 75, Label = "Done", Color = "#0f0", Active = true },
            new ProgressGap { Value = 25 }
          ]
        },
        Style = new ProgressStyle
        {
          Color = new ProgressColor { Legend = "#bbb", Title = "#ccc", Track = "#ddd" },
          Font = new ChartFontStyle { Size = 15 },
          Radius = new ProgressRadius { Segment = 4, Track = 12 }
        }
      }
    ]
  };

  private static ElementGrid Grid(int row, int column) => new()
  {
    Row = row,
    Column = column,
    RowSpan = 1,
    ColumnSpan = 1,
    Anchor = ElementAnchor.Center
  };

  private static AxisChartStyle AxisStyle() => new()
  {
    Color = new AxisChartColor
    {
      Legend = "#abc",
      Title = "#bcd",
      Line = "#cde"
    },
    Font = new ChartFontStyle { Size = 16 },
    Axis = new AxisStyle
    {
      Label = "#def",
      Line = "#efa",
      Grid = "#fab"
    }
  };
}
