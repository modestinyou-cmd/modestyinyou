$f = 'c:\Users\alsye\Documents\Codex\2026-10-10\b\src\app\globals.css'
$lines = [System.IO.File]::ReadAllLines($f)
$result = [System.Collections.Generic.List[string]]::new()

for($i=0; $i -lt $lines.Count; $i++){
  $result.Add($lines[$i])
  # After line 500 (0-indexed 499): "  .story-opening-copy{max-width:100%}"
  # insert the missing closing brace for @media(max-width:700px)
  if($i -eq 499 -and $lines[$i].Trim() -eq '.story-opening-copy{max-width:100%}'){
    $result.Add('}')
    Write-Host "Inserted } after line 500"
  }
}

# Now remove the wrongly-inserted } lines at the end of file
# They appear after the new header block. Find the last real CSS rule and trim trailing }
$arr = $result.ToArray()
# Find index of last line that contains actual CSS (not just })
$lastReal = $arr.Count - 1
while($lastReal -ge 0 -and $arr[$lastReal].Trim() -eq '}'){
  $lastReal--
}
Write-Host "Last real line $($lastReal+1): $($arr[$lastReal])"

# Keep everything up to and including lastReal
$trimmed = $arr[0..$lastReal]
[System.IO.File]::WriteAllLines($f, $trimmed)

# Verify balance
$css = [System.IO.File]::ReadAllText($f)
$ob = ($css.ToCharArray() | Where-Object {$_ -eq '{'}).Count
$cb = ($css.ToCharArray() | Where-Object {$_ -eq '}'}).Count
Write-Host "Balance: open=$ob close=$cb diff=$($ob-$cb)"

# Show lines 496-506
$lines2 = [System.IO.File]::ReadAllLines($f)
for($i=494;$i -le [Math]::Min(506,$lines2.Count-1);$i++){
  Write-Host "$($i+1)|$($lines2[$i])"
}
Write-Host "Total lines: $($lines2.Count)"
