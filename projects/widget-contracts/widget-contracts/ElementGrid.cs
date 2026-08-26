using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts;

public sealed class ElementGrid
{
  public int Row { get; set; }
  public int Column { get; set; }
  public int RowSpan { get; set; }
  public int ColumnSpan { get; set; }
  public ElementAnchor? Anchor { get; set; }
}
