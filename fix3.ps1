$f = 'c:\Users\alsye\Documents\Codex\2026-10-10\b\src\app\globals.css'
$lines = [System.IO.File]::ReadAllLines($f)

# Find and remove any line that is just "}" between the story section and /* Default */
$result = [System.Collections.Generic.List[string]]::new()
$inDangerZone = $false
foreach($line in $lines){
  if($line -match '\.story-opening-copy'){ $inDangerZone = $true }
  if($line -match '/\* .* Default'){ $inDangerZone = $false }
  # Skip lone } lines only in the danger zone
  if($inDangerZone -and $line.Trim() -eq '}'){
    Write-Host "Removing lone brace line: '$line'"
    continue
  }
  $result.Add($line)
}

[System.IO.File]::WriteAllLines($f, $result)

# Verify lines 496-508
$lines2 = [System.IO.File]::ReadAllLines($f)
for($i=494; $i -le [Math]::Min(508, $lines2.Count-1); $i++){
  Write-Host "$($i+1): $($lines2[$i])"
}
