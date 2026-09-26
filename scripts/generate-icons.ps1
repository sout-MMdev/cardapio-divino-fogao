# Gera ícones do PWA: monograma "DF" em creme sobre bordô (tema A).
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$bordo = [System.Drawing.ColorTranslator]::FromHtml("#6B1D22")
$creme = [System.Drawing.ColorTranslator]::FromHtml("#F4EEE4")
New-Item -ItemType Directory -Force -Path "$root\public\icons" | Out-Null

function New-Icon([int]$size, [string]$path, [double]$scale) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $g.TextRenderingHint = "AntiAliasGridFit"
  $g.Clear($bordo)
  $font = New-Object System.Drawing.Font "Georgia", ([float]($size * 0.46 * $scale)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = "Center"
  $fmt.LineAlignment = "Center"
  $fmt.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap
  $brush = New-Object System.Drawing.SolidBrush $creme
  $rect = New-Object System.Drawing.RectangleF 0, ([float]($size * 0.03)), $size, $size
  $g.DrawString("DF", $font, $brush, $rect, $fmt)
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

New-Icon 192 "$root\public\icons\icon-192.png" 1.0
New-Icon 512 "$root\public\icons\icon-512.png" 1.0
New-Icon 512 "$root\public\icons\maskable-512.png" 0.72
New-Icon 180 "$root\src\app\apple-icon.png" 1.0
New-Icon 64 "$root\src\app\icon.png" 1.0
Write-Output "icones gerados"
