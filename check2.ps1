$f = 'c:\Users\alsye\Documents\Codex\2026-10-10\b\src\app\globals.css'
$css = [System.IO.File]::ReadAllText($f)
$css = $css -replace "`r`n","`n" -replace "`r","`n"

# Check current balance
$ob = ($css.ToCharArray() | Where-Object {$_ -eq '{'}).Count
$cb = ($css.ToCharArray() | Where-Object {$_ -eq '}'}).Count
Write-Host "Current balance: open=$ob close=$cb diff=$($ob-$cb)"

# Show 10 lines around the story/default boundary
$lines = $css -split "`n"
Write-Host "Total lines: $($lines.Count)"
for($i=493;$i -le [Math]::Min(510,$lines.Count-1);$i++){
  Write-Host "$($i+1)|$($lines[$i])"
}
