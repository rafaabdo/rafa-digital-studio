# Generates the raster brand assets (favicons + Open Graph image) for RAFA DIGITAL STUDIO.
# Requires Windows PowerShell 5+ (System.Drawing). Run: powershell -ExecutionPolicy Bypass -File tools/make-assets.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$imgDir = Join-Path $root "assets\img"
$accent = [System.Drawing.ColorTranslator]::FromHtml("#6558E8")
$accent2 = [System.Drawing.ColorTranslator]::FromHtml("#8B7DFF")
$ink = [System.Drawing.ColorTranslator]::FromHtml("#22252B")
$paper = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function Add-Mark([System.Drawing.Graphics]$g, [float]$x, [float]$y, [float]$size, [System.Drawing.Color]$color) {
  $s = $size / 48.0
  $pen = New-Object System.Drawing.Pen($color, (5.4 * $s))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $stem = New-RoundedPath ($x + 12.5 * $s) ($y + 9 * $s) (3.0 * $s) (30 * $s) (1.5 * $s)
  $g.DrawPath($pen, $stem)
  $g.DrawLine($pen, $x + 12.5 * $s, $y + 9 * $s, $x + 25.7 * $s, $y + 9 * $s)
  $g.DrawArc($pen, $x + 16.3 * $s, $y + 9 * $s, (18.8 * $s), (18.8 * $s), -90, 180)
  $g.DrawLine($pen, $x + 25.7 * $s, $y + 27.8 * $s, $x + 12.5 * $s, $y + 27.8 * $s)
  $g.DrawLine($pen, $x + 26.4 * $s, $y + 27.8 * $s, $x + 37.5 * $s, $y + 39 * $s)
  $dot = New-Object System.Drawing.SolidBrush($color)
  $g.FillEllipse($dot, $x + 36 * $s, $y + 4 * $s, 8 * $s, 8 * $s)
  $dot.Dispose(); $pen.Dispose(); $stem.Dispose()
}

function New-IconPng([int]$target, [string]$path) {
  $scale = 4
  $size = $target * $scale
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)
  $pathObj = New-RoundedPath 0 0 $size $size ($size * 0.25)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle(0, 0, $size, $size)), $accent, $accent2, 45)
  $g.FillPath($brush, $pathObj)
  Add-Mark $g ($size * 0.02) ($size * 0.02) ($size * 0.96) $paper
  $g.Dispose()
  $out = New-Object System.Drawing.Bitmap($target, $target)
  $og = [System.Drawing.Graphics]::FromImage($out)
  $og.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $og.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $og.DrawImage($bmp, 0, 0, $target, $target)
  $og.Dispose()
  $out.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $out.Dispose(); $bmp.Dispose(); $brush.Dispose(); $pathObj.Dispose()
}

New-IconPng 32 (Join-Path $imgDir "favicon-32.png")
New-IconPng 180 (Join-Path $imgDir "apple-touch-icon.png")
New-IconPng 192 (Join-Path $imgDir "icon-192.png")
New-IconPng 512 (Join-Path $imgDir "icon-512.png")

# Open Graph image 1200 x 630
$W = 1200; $H = 630
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.ColorTranslator]::FromHtml("#14161C"))

# soft glow
for ($i = 14; $i -ge 1; $i--) {
  $alpha = [Math]::Max(2, 10 - [int]($i / 2))
  $b = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 101, 88, 232))
  $d = 260 + $i * 34
  $g.FillEllipse($b, (820 - $d / 2), (120 - $d / 2), $d, $d)
  $b.Dispose()
}

# dot grid
$dot = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(18, 255, 255, 255))
for ($x = 60; $x -lt 620; $x += 28) {
  for ($y = 60; $y -lt 590; $y += 28) {
    $g.FillEllipse($dot, $x, $y, 2, 2)
  }
}
$dot.Dispose()

# concentric rings
$ring = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(28, 255, 255, 255), 1)
$g.DrawEllipse($ring, 690, -80, 440, 440)
$g.DrawEllipse($ring, 760, -10, 300, 300)
$ring.Dispose()

# logo lockup
Add-Mark $g 88 96 92 $paper
$fontRafa = New-Object System.Drawing.Font("Segoe UI", 74, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fontSub = New-Object System.Drawing.Font("Segoe UI", 17, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fontTag = New-Object System.Drawing.Font("Segoe UI", 26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$lilac = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#B9B1FF"))
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#9AA0AE"))
$g.DrawString("RAFA", $fontRafa, $white, 86, 210)
$x = 90
foreach ($ch in "DIGITAL STUDIO".ToCharArray()) {
  $g.DrawString([string]$ch, $fontSub, $lilac, $x, 300)
  if ($ch -eq " ") { $x += 16 } else { $x += 20 }
}
$g.DrawString("Turning ideas into digital", $fontTag, $white, 86, 372)
$g.DrawString("experiences that make a difference.", $fontTag, $white, 86, 406)
$line = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 185, 177, 255), 2)
$g.DrawLine($line, 88, 474, 500, 474)
$g.DrawString("WEB DESIGN  ·  WEB APPS  ·  BRANDING  ·  MARKETING", $fontSmall, $muted, 88, 500)
$g.DrawString("rafadigitalstudio.com", $fontSmall, $muted, 88, 536)

# browser card
$card = New-RoundedPath 700 150 390 330 22
$cardFill = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#1D2029"))
$g.FillPath($cardFill, $card)
$cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 255, 255, 255), 1.5)
$g.DrawPath($cardPen, $card)
$inside = New-RoundedPath 722 202 346 200 14
$insideBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle(722, 202, 346, 200)), $accent, [System.Drawing.ColorTranslator]::FromHtml("#423399"), 35)
$g.FillPath($insideBrush, $inside)
$circle = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 255, 255, 255))
$g.FillEllipse($circle, 900, 230, 140, 140)
$g.FillEllipse($circle, 936, 266, 68, 68)
$bar = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 255, 255, 255))
$g.FillRectangle($bar, 748, 246, 130, 13)
$barSoft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 255, 255, 255))
$g.FillRectangle($barSoft, 748, 274, 96, 9)
$g.FillRectangle($barSoft, 748, 292, 110, 9)
$g.FillRectangle($bar, 748, 326, 90, 30)
$g.FillRectangle($barSoft, 722 + 16, 424, 90, 8)
$g.FillRectangle($barSoft, 722 + 16, 442, 150, 8)
$g.FillRectangle($barSoft, 722 + 16, 460, 70, 8)
$g.DrawString("rafadigitalstudio.com", $fontSmall, $muted, 746, 168)

# floating badge
$pill = New-RoundedPath 780 524 230 52 26
$pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#FFFFFF"))
$g.FillPath($pillBrush, $pill)
$dotG = New-Object System.Drawing.SolidBrush($accent)
$g.FillEllipse($dotG, 800, 544, 12, 12)
$badgeFont = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString("DIGITAL STUDIO", $badgeFont, (New-Object System.Drawing.SolidBrush($ink)), 824, 541)

$g.Dispose()
$bmp.Save((Join-Path $imgDir "og-image.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# 32px .ico
$icon = New-Object System.Drawing.Bitmap((Join-Path $imgDir "favicon-32.png"))
$hIcon = $icon.GetHicon()
$ico = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::Create((Join-Path $root "favicon.ico"))
$ico.Save($fs)
$fs.Close()
$ico.Dispose(); $icon.Dispose()

Remove-Item (Join-Path $imgDir "..\fonts\google.css") -ErrorAction SilentlyContinue
Write-Host "Assets generated."
