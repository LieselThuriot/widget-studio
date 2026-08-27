using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts;

public sealed class GridTrack
{
  public double? Size { get; set; }
  public GridUnit Unit { get; set; }

  public static GridTrack Auto => new() { Unit = GridUnit.Auto };
  public static GridTrack Pixel(double size) => new() { Size = size, Unit = GridUnit.Pixel };
  public static GridTrack Star() => Star(1);
  public static GridTrack Star(double size) => new() { Size = size, Unit = GridUnit.Star };
}
