using System.Text.Json;
using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts;

[JsonSourceGenerationOptions(JsonSerializerDefaults.Web, DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, UseStringEnumConverter = true)]
[JsonSerializable(typeof(WidgetContract))]
public partial class WidgetJsonContext : JsonSerializerContext;