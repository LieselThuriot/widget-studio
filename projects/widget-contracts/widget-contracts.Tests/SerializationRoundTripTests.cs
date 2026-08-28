using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace WidgetStudio.Contracts.Tests;

public sealed class SerializationRoundTripTests
{
    [Fact]
    public void CompleteWidgetRoundTripsWithSourceGeneratedContext()
    {
        var original = ContractFixtures.CreateCompleteWidget();
        var json = JsonSerializer.Serialize(original, WidgetJsonContext.Default.WidgetContract);
        var result = JsonSerializer.Deserialize(json, WidgetJsonContext.Default.WidgetContract);

        Assert.NotNull(result);
        ContractAssertions.Equal(original, result);
        ContractAssertions.AssertWireFormat(json);
    }

    [Fact]
    public void CompleteWidgetRoundTripsWithReflection()
    {
        var options = CreateReflectionOptions();
        var original = ContractFixtures.CreateCompleteWidget();
        var json = JsonSerializer.Serialize(original, options);
        var result = JsonSerializer.Deserialize<WidgetContract>(json, options);

        Assert.NotNull(result);
        ContractAssertions.Equal(original, result);
        ContractAssertions.AssertWireFormat(json);
    }

    [Fact]
    public void SourceGeneratedAndReflectionSerializationHaveEquivalentWireFormat()
    {
        var widget = ContractFixtures.CreateCompleteWidget();
        var generated = JsonSerializer.Serialize(widget, WidgetJsonContext.Default.WidgetContract);
        var reflection = JsonSerializer.Serialize(widget, CreateReflectionOptions());

        Assert.True(JsonNode.DeepEquals(JsonNode.Parse(generated), JsonNode.Parse(reflection)));
    }

    private static JsonSerializerOptions CreateReflectionOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web)
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        return options;
    }
}