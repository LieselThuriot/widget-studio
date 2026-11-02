using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace WidgetStudio.Contracts;

/// <summary>
/// Computes a stable fingerprint of a widget's look, matching
/// <c>computeWidgetFingerprint</c> from <c>@lieselthuriot/widget-renderer</c>.
/// </summary>
/// <remarks>
/// Content that may vary per visitor is ignored: text, button labels, image alt text,
/// chart titles, chart data, button URLs and bodies, the widget id, and the refresh label.
/// Only whether text, labels, alt text, and titles are empty is included.
/// </remarks>
public static class WidgetFingerprint
{
    /// <summary>The version prefix of the fingerprint algorithm.</summary>
    public const int Version = 1;

    /// <summary>Computes the fingerprint, or returns <see langword="null"/> for an invalid widget.</summary>
    public static string? Compute(WidgetContract? widget)
    {
        if (widget is null || widget.Version != 2 || widget.Rows is not { Count: > 0 } || widget.Columns is not { Count: > 0 })
        {
            return null;
        }

        var node = JsonNode.Parse(JsonSerializer.Serialize(widget, WidgetJsonContext.Default.WidgetContract))!.AsObject();
        return Hash(WidgetShape(node));
    }

    /// <summary>Computes the fingerprint of a JSON payload, or returns <see langword="null"/> for an invalid widget.</summary>
    public static string? Compute(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            return Compute(JsonSerializer.Deserialize(json!, WidgetJsonContext.Default.WidgetContract));
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static string Hash(JsonNode shape)
    {
        var builder = new StringBuilder();
        WriteCanonical(shape, builder);
        using var sha = SHA256.Create();
        var hash = sha.ComputeHash(Encoding.UTF8.GetBytes(builder.ToString()));
        var hex = new StringBuilder("wfp:")
          .Append(Version.ToString(CultureInfo.InvariantCulture))
          .Append(':');
        foreach (var value in hash)
        {
            hex.Append(value.ToString("x2", CultureInfo.InvariantCulture));
        }

        return hex.ToString();
    }

    private static JsonObject WidgetShape(JsonObject widget)
    {
        var refresh = widget["refresh"] as JsonObject;
        var elements = new JsonArray();
        foreach (var element in widget["elements"]!.AsArray())
        {
            elements.Add(ElementShape(element!.AsObject()));
        }

        return new JsonObject
        {
            ["version"] = Copy(widget["version"]),
            ["size"] = Copy(widget["size"]),
            ["rows"] = Copy(widget["rows"]),
            ["columns"] = Copy(widget["columns"]),
            ["background"] = Copy(widget["background"]),
            ["refresh"] = new JsonObject { ["enabled"] = refresh?["enabled"]?.GetValue<bool>() ?? false },
            ["elements"] = elements
        };
    }

    private static JsonObject ElementShape(JsonObject element)
    {
        var type = element["type"]!.GetValue<string>();
        var shape = new JsonObject
        {
            ["type"] = type,
            ["grid"] = Copy(element["grid"])
        };

        if (type != "divider")
        {
            shape["sensitive"] = Copy(element["sensitive"]);
        }

        switch (type)
        {
            case "text":
                shape["hasText"] = HasContent(element["text"]);
                var style = Copy(element["style"])!.AsObject();
                var font = style["font"]!.AsObject();
                style["font"] = new JsonObject
                {
                    ["size"] = Copy(font["size"]),
                    ["bold"] = Flag(font["bold"]),
                    ["italic"] = Flag(font["italic"]),
                    ["underline"] = Flag(font["underline"]),
                    ["strikethrough"] = Flag(font["strikethrough"])
                };
                if (style["padding"] is null)
                {
                    style["padding"] = new JsonObject { ["vertical"] = 0d, ["horizontal"] = 0d };
                }

                shape["style"] = style;
                break;
            case "image":
                shape["source"] = Copy(element["source"]);
                shape["hasAlt"] = HasContent(element["alt"]);
                shape["fit"] = Copy(element["fit"]);
                shape["overlayColor"] = Copy(element["overlayColor"]);
                shape["radius"] = Copy(element["radius"]);
                break;
            case "button":
                shape["hasLabel"] = HasContent(element["label"]);
                shape["method"] = Copy(element["method"]);
                shape["requestRefresh"] = Flag(element["requestRefresh"]);
                shape["showOnlyOnHover"] = Flag(element["showOnlyOnHover"]);
                shape["style"] = Copy(element["style"]);
                break;
            case "divider":
                shape["orientation"] = Copy(element["orientation"]);
                shape["style"] = Copy(element["style"]);
                break;
            default:
                shape["hasTitle"] = HasContent(element["title"]);
                shape["showLegend"] = Copy(element["showLegend"]);
                shape["style"] = Copy(element["style"]);
                break;
        }

        return shape;
    }

    private static JsonNode? Copy(JsonNode? node) => node?.DeepClone();

    private static bool Flag(JsonNode? node) => node?.GetValue<bool>() ?? false;

    private static bool HasContent(JsonNode? node) =>
        node is not null && node.GetValue<string>().Trim().Length > 0;

    private static void WriteCanonical(JsonNode? node, StringBuilder builder)
    {
        switch (node)
        {
            case null:
                builder.Append("null");
                break;
            case JsonObject value:
                builder.Append('{');
                var first = true;
                foreach (var property in value
                  .Where(property => property.Value is not null && property.Value.GetValueKind() != JsonValueKind.Null)
                  .OrderBy(property => property.Key, StringComparer.Ordinal))
                {
                    if (!first)
                    {
                        builder.Append(',');
                    }

                    first = false;
                    WriteString(property.Key, builder);
                    builder.Append(':');
                    WriteCanonical(property.Value, builder);
                }

                builder.Append('}');
                break;
            case JsonArray value:
                builder.Append('[');
                for (var index = 0; index < value.Count; index++)
                {
                    if (index > 0)
                    {
                        builder.Append(',');
                    }

                    WriteCanonical(value[index], builder);
                }

                builder.Append(']');
                break;
            default:
                switch (node.GetValueKind())
                {
                    case JsonValueKind.String:
                        WriteString(node.GetValue<string>(), builder);
                        break;
                    case JsonValueKind.Number:
                        builder.Append(FormatNumber(node.GetValue<double>()));
                        break;
                    case JsonValueKind.True:
                        builder.Append("true");
                        break;
                    case JsonValueKind.False:
                        builder.Append("false");
                        break;
                    default:
                        builder.Append("null");
                        break;
                }

                break;
        }
    }

    private static string FormatNumber(double value)
    {
        var text = value.ToString("F6", CultureInfo.InvariantCulture).TrimEnd('0').TrimEnd('.');
        return text == "-0" ? "0" : text;
    }

    private static void WriteString(string value, StringBuilder builder)
    {
        var normalized = value.StartsWith("#", StringComparison.Ordinal) ? value.ToLowerInvariant() : value;
        builder.Append('"');
        foreach (var character in normalized)
        {
            if (character is '"' or '\\')
            {
                builder.Append('\\').Append(character);
            }
            else if (character < 0x20)
            {
                builder.Append("\\u").Append(((int)character).ToString("x4", CultureInfo.InvariantCulture));
            }
            else
            {
                builder.Append(character);
            }
        }

        builder.Append('"');
    }
}
