using System.Text.Json.Serialization;

using WidgetStudio.Contracts.Enums;

namespace WidgetStudio.Contracts.Data;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(ProgressSegment), "segment")]
[JsonDerivedType(typeof(ProgressGap), "gap")]
public abstract class ProgressItem
{
    [JsonIgnore]
    public abstract ProgressItemKind Kind { get; }
    public required double Value { get; set; }
}

public sealed class ProgressSegment : ProgressItem
{
    [JsonIgnore]
    public override ProgressItemKind Kind => ProgressItemKind.Segment;
    public required string Label { get; set; }
    public required string Color { get; set; }
    public required bool Active { get; set; }
}

public sealed class ProgressGap : ProgressItem
{
    [JsonIgnore]
    public override ProgressItemKind Kind => ProgressItemKind.Gap;
}