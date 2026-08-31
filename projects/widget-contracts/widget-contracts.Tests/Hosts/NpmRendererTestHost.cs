using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text.Json;

namespace WidgetStudio.Contracts.Tests.Hosts;

internal static class NpmRendererTestHost
{
    public static async Task BuildAsync(string repositoryRoot)
    {
        var result = await RunProcessAsync(
          GetNpmExecutable(),
          "run build:renderer",
          repositoryRoot,
          string.Empty);

        Assert.True(result.ExitCode == 0, $"npm renderer build failed:\n{result.StandardError}");
    }

    public static async Task<ValidationResult> ValidateAsync(string repositoryRoot, string json)
    {
        var result = await RunProcessAsync(
          GetNodeExecutable(),
          "scripts/validate-widget-contract.mjs",
          repositoryRoot,
          json);

        if (!string.IsNullOrWhiteSpace(result.StandardOutput))
        {
            using var document = JsonDocument.Parse(result.StandardOutput);
            var root = document.RootElement;
            return new ValidationResult
            {
                Success = root.GetProperty("success").GetBoolean(),
                Issues = root.TryGetProperty("issues", out var issues) ? issues.ToString() : string.Empty
            };
        }

        return new ValidationResult
        {
            Success = false,
            Issues = string.IsNullOrWhiteSpace(result.StandardError)
              ? $"Node exited with code {result.ExitCode} without a result."
              : result.StandardError
        };
    }

    public static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null &&
               (!File.Exists(Path.Combine(directory.FullName, "package.json")) ||
                !Directory.Exists(Path.Combine(directory.FullName, "scripts"))))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new DirectoryNotFoundException("Could not find the workspace root.");
    }

    private static string GetNpmExecutable() =>
      RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
        ? FindExecutable("npm.cmd", path =>
          File.Exists(Path.Combine(Path.GetDirectoryName(path)!, "node_modules", "npm", "bin", "npm-cli.js")))
        : "npm";

    private static string GetNodeExecutable() =>
      RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? FindExecutable("node.exe") : "node";

    private static string FindExecutable(string fileName, Func<string, bool>? predicate = null)
    {
        foreach (var directory in (Environment.GetEnvironmentVariable("PATH") ?? string.Empty)
          .Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
        {
            var path = Path.Combine(directory, fileName);
            if (File.Exists(path) && (predicate is null || predicate(path)))
            {
                return path;
            }
        }

        throw new FileNotFoundException($"Could not find {fileName} on PATH.");
    }

    private static async Task<ProcessResult> RunProcessAsync(
      string fileName,
      string arguments,
      string workingDirectory,
      string standardInput)
    {
        using var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = arguments,
                WorkingDirectory = workingDirectory,
                UseShellExecute = false,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            }
        };

        Assert.True(process.Start(), $"Could not start {fileName}.");
        await process.StandardInput.WriteAsync(standardInput);
        process.StandardInput.Close();

        var outputTask = process.StandardOutput.ReadToEndAsync();
        var errorTask = process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        return new ProcessResult
        {
            ExitCode = process.ExitCode,
            StandardOutput = await outputTask,
            StandardError = await errorTask
        };
    }

    internal sealed class ProcessResult
    {
        public int ExitCode { get; init; }
        public string StandardOutput { get; init; } = string.Empty;
        public string StandardError { get; init; } = string.Empty;
    }

    internal sealed class ValidationResult
    {
        public bool Success { get; init; }
        public string Issues { get; init; } = string.Empty;
    }
}
