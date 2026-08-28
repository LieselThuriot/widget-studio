namespace WidgetStudio.Contracts;

/// <summary>
/// Creates CSS color strings accepted by the widget renderer.
/// </summary>
public static class WidgetColor
{
    public const string Black = "#000000";
    public const string White = "#ffffff";
    public const string Red = "#ff0000";
    public const string Orange = "#ffa500";
    public const string Yellow = "#ffff00";
    public const string Green = "#008000";
    public const string Blue = "#0000ff";
    public const string Purple = "#800080";
    public const string Pink = "#ffc0cb";
    public const string Brown = "#a52a2a";
    public const string Gray = "#808080";
    public const string Grey = Gray;
    public const string Transparent = "#00000000";

    public static string Rgb(byte red, byte green, byte blue) =>
        $"#{red:x2}{green:x2}{blue:x2}";

    public static string Rgba(byte red, byte green, byte blue, byte alpha) =>
        $"#{red:x2}{green:x2}{blue:x2}{alpha:x2}";

    /// <summary>
    /// Blends a color toward white. The default produces a 50% pastel variant.
    /// </summary>
    /// <param name="color">A #RGB, #RRGGBB, or #RRGGBBAA color.</param>
    /// <param name="amount">The proportion to blend toward white, from 0 to 1.</param>
    public static string Pastel(string color, double amount = 0.5)
    {
        if (color is null)
        {
            throw new ArgumentNullException(nameof(color));
        }

        if (string.IsNullOrWhiteSpace(color))
        {
            throw new ArgumentException("The color cannot be empty.", nameof(color));
        }

        if (amount is < 0 or > 1)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), amount, "The amount must be between 0 and 1.");
        }

        var value = color.Trim();
        if (value[0] is not '#')
        {
            throw new FormatException("The color must be a hexadecimal color beginning with '#'.");
        }

        var hex = value.Substring(1);
        var hasAlpha = hex.Length is 8;
        if (hex.Length is 3)
        {
            hex = string.Concat(hex.Select(character => new string(character, 2)));
        }
        else if (hex.Length is not (6 or 8))
        {
            throw new FormatException("The color must use #RGB, #RRGGBB, or #RRGGBBAA format.");
        }

        if (!hex.All(Uri.IsHexDigit))
        {
            throw new FormatException("The color contains an invalid hexadecimal digit.");
        }

        var red = PastelChannel(Convert.ToByte(hex.Substring(0, 2), 16), amount);
        var green = PastelChannel(Convert.ToByte(hex.Substring(2, 2), 16), amount);
        var blue = PastelChannel(Convert.ToByte(hex.Substring(4, 2), 16), amount);

        return hasAlpha
            ? Rgba(red, green, blue, Convert.ToByte(hex.Substring(6, 2), 16))
            : Rgb(red, green, blue);
    }

    private static byte PastelChannel(byte channel, double amount) =>
        (byte)Math.Round(channel + ((255 - channel) * amount), MidpointRounding.AwayFromZero);
}