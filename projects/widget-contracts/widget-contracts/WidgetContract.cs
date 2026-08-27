using WidgetStudio.Contracts.Elements;
using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts;

public sealed class WidgetContract
{
  public int Version { get; set; } = 2;
  public WidgetSize Size { get; set; }
  public List<GridTrack> Rows { get; set; } = [];
  public List<GridTrack> Columns { get; set; } = [];
  public BackgroundConfig Background { get; set; } = new();
  public RefreshConfig? Refresh { get; set; }
  public List<WidgetElement> Elements { get; set; } = [];
}
