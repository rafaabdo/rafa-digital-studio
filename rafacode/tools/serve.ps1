# Tiny local static preview server (no Node/Python required).
# Usage: powershell -ExecutionPolicy Bypass -File tools/serve.ps1 -Port 4173
param([int]$Port = 4173)

$root = [System.IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "RAFA DIGITAL STUDIO preview: http://localhost:$Port/"
Write-Host "Serving: $root"

$types = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".ico"  = "image/x-icon"
  ".woff2" = "font/woff2"
  ".xml"  = "application/xml; charset=utf-8"
  ".txt"  = "text/plain; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $localPath = $request.Url.LocalPath
    if ($localPath -eq "/") { $localPath = "/index.html" }
    if ($localPath.EndsWith("/")) { $localPath += "index.html" }

    $relative = $localPath.TrimStart("/") -replace "/", "\"
    $file = [System.IO.Path]::GetFullPath((Join-Path $root $relative))

    if (-not $file.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
      $response.StatusCode = 403
      $response.Close()
      continue
    }

    if (Test-Path $file -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
      $response.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
      $response.Headers.Add("Cache-Control", "no-store")
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $response.ContentType = "text/html; charset=utf-8"
      $notFound = Join-Path $root "404.html"
      if (Test-Path $notFound) {
        $bytes = [System.IO.File]::ReadAllBytes($notFound)
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 - Not found")
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    }
    $response.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
