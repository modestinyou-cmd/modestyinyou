$f = 'c:\Users\alsye\Documents\Codex\2026-10-10\b\src\app\globals.css'
$css = [System.IO.File]::ReadAllText($f)
$css = $css -replace "`r`n","`n" -replace "`r","`n"

# Find the announcement-bar rule we added (start of our new header block)
$idx = $css.IndexOf('.announcement-bar{')
# Find the FIRST occurrence - that's where our new block starts
Write-Host "First announcement-bar at: $idx"

# The stable part is everything before our new header block
# Our new block starts with a comment then .announcement-bar
# Find the comment line before it
$commentIdx = $css.LastIndexOf('/*', $idx)
Write-Host "Comment before announcement-bar at: $commentIdx"

# Use the comment as the cut point
$stable = $css.Substring(0, $commentIdx).TrimEnd()

$ob = ($stable.ToCharArray() | Where-Object {$_ -eq '{'}).Count
$cb = ($stable.ToCharArray() | Where-Object {$_ -eq '}'}).Count
Write-Host "Stable: open=$ob close=$cb diff=$($ob-$cb) len=$($stable.Length)"

$stableLines = $stable -split "`n"
Write-Host "Lines: $($stableLines.Count)"
for($i=[Math]::Max(0,$stableLines.Count-8); $i -lt $stableLines.Count; $i++){
  Write-Host "$($i+1)|$($stableLines[$i])"
}
