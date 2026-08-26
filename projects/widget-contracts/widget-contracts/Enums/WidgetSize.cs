using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum WidgetSize
{
  [JsonStringEnumMemberName("mini")] Mini,
  [JsonStringEnumMemberName("square")] Square,
  [JsonStringEnumMemberName("wide")] Wide,
  [JsonStringEnumMemberName("mega")] Mega,
  [JsonStringEnumMemberName("hero")] Hero
}
