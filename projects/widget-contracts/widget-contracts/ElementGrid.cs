using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts;

public sealed class ElementGrid
{
    public required int Row { get; set; }
    public required int Column { get; set; }
    public required int RowSpan { get; set; }
    public required int ColumnSpan { get; set; }
    public ElementAnchor? Anchor { get; set; }
}