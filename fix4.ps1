$f = 'c:\Users\alsye\Documents\Codex\2026-10-10\b\src\app\globals.css'
$css = [System.IO.File]::ReadAllText($f)

# The @media(max-width:700px) block is now missing its closing }
# Find it and add the closing brace back
$target = "  .story-opening-copy{max-width:100%}`n/* "
$replacement = "  .story-opening-copy{max-width:100%}`n}`n/* "
$css = $css.Replace($target, $replacement)

[System.IO.File]::WriteAllText($f, $css)

# Verify brace balance
$open = ($css.ToCharArray() | Where-Object {$_ -eq '{'}).Count
$close = ($css.ToCharArray() | Where-Object {$_ -eq '}'}).Count
Write-Host "Open braces: $open"
Write-Host "Close braces: $close"
Write-Host "Balance: $($open - $close) (should be 0)"

# Show lines 495-505
$lines = $css -split "`n"
for($i=493; $i -le [Math]::Min(505, $lines.Count-1); $i++){
  Write-Host "$($i+1): $($lines[$i])"
}
