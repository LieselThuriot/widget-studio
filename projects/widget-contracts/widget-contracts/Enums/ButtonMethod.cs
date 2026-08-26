using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Enums;

public enum ButtonMethod
{
  [JsonStringEnumMemberName("get")] Get,
  [JsonStringEnumMemberName("post")] Post
}
