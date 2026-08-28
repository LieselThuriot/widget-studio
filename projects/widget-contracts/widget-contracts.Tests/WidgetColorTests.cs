using WidgetStudio.Contracts;

namespace WidgetStudio.Contracts.Tests;

public sealed class WidgetColorTests
{
    [Fact]
    public void RgbAndRgbaUseCanonicalLowercaseHex()
    {
        Assert.Equal("#1020ff", WidgetColor.Rgb(16, 32, 255));
        Assert.Equal("#1020ff80", WidgetColor.Rgba(16, 32, 255, 128));
    }

    [Fact]
    public void CommonColorsAreAvailable()
    {
        Assert.Equal("#ff0000", WidgetColor.Red);
        Assert.Equal("#0000ff", WidgetColor.Blue);
        Assert.Equal("#808080", WidgetColor.Gray);
        Assert.Equal("#808080", WidgetColor.Grey);
        Assert.Equal("#00000000", WidgetColor.Transparent);
    }

    [Theory]
    [InlineData("#0000ff", "#8080ff")]
    [InlineData("#00f", "#8080ff")]
    [InlineData("#0000ff80", "#8080ff80")]
    [InlineData("#ffffff", "#ffffff")]
    public void PastelBlendsTowardWhiteAndPreservesAlpha(string color, string expected)
    {
        Assert.Equal(expected, WidgetColor.Pastel(color));
    }

    [Fact]
    public void PastelSupportsCustomBlendAmount()
    {
        Assert.Equal("#4040ff", WidgetColor.Pastel(WidgetColor.Blue, 0.25));
        Assert.Equal("#0000ff", WidgetColor.Pastel(WidgetColor.Blue, 0));
        Assert.Equal("#ffffff", WidgetColor.Pastel(WidgetColor.Blue, 1));
    }

    [Theory]
    [InlineData("blue")]
    [InlineData("#12")]
    [InlineData("#12345g")]
    public void PastelRejectsInvalidColors(string color)
    {
        Assert.Throws<FormatException>(() => WidgetColor.Pastel(color));
    }

    [Fact]
    public void PastelRejectsInvalidBlendAmount()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => WidgetColor.Pastel(WidgetColor.Blue, 1.1));
    }
}