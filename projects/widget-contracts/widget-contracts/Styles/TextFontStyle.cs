namespace WidgetStudio.Contracts.Styles;

public sealed class TextFontStyle
{
    public required double Size { get; set; }
    public bool? Bold { get; set; }
    public bool? Italic { get; set; }
    public bool? Underline { get; set; }
    public bool? Strikethrough { get; set; }
}