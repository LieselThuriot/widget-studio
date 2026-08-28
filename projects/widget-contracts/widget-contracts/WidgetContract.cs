using WidgetStudio.Contracts.Elements;
using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts;

public sealed class WidgetContract
{
    public int Version { get; set; } = 2;
    public required string Id { get; set; }
    public required WidgetSize Size { get; set; }
    public required List<GridTrack> Rows { get; set; }
    public required List<GridTrack> Columns { get; set; }
    public required BackgroundConfig Background { get; set; }
    public RefreshConfig? Refresh { get; set; }
    public required List<WidgetElement> Elements { get; set; }
}
