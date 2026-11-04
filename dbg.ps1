$f = 'c:\Users\alsye\Documents\Codex\2026-10-10\b\src\app\globals.css'
$lines = [System.IO.File]::ReadAllLines($f)
for($i=490; $i -le 515; $i++){
  Write-Host "$($i+1): $($lines[$i])"
}
