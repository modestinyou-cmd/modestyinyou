$f = 'c:\Users\alsye\Documents\Codex\2026-10-10\b\src\app\globals.css'
$css = [System.IO.File]::ReadAllText($f)

# Normalize line endings
$css = $css -replace "`r`n", "`n"
$css = $css -replace "`r", "`n"

# Count braces before
$ob = ($css.ToCharArray() | Where-Object {$_ -eq '{'}).Count
$cb = ($css.ToCharArray() | Where-Object {$_ -eq '}'}).Count
Write-Host "BEFORE: open=$ob close=$cb balance=$($ob-$cb)"

# The fix3.ps1 removed 38 closing braces. We need to find all the media query
# closing braces that were stripped and restore them.
# Strategy: find every @media block that is now missing its closing brace.
# Simpler: just find the specific broken spots by looking for @media blocks
# that are not closed before the next top-level rule.

# Actually the cleanest fix: find each @media(...){ that has no matching }
# by scanning and rebalancing.

$lines = $css -split "`n"
$result = [System.Collections.Generic.List[string]]::new()
$depth = 0

foreach ($line in $lines) {
    $opens  = ($line.ToCharArray() | Where-Object {$_ -eq '{'}).Count
    $closes = ($line.ToCharArray() | Where-Object {$_ -eq '}'}).Count
    $prevDepth = $depth
    $depth = $depth + $opens - $closes

    # If this line would take us from depth>0 to depth<0, it's an extra }
    # If this line starts a new top-level rule but depth>0, we need to close first
    if ($depth -lt 0) {
        # Skip this line (it's an orphaned })
        $depth = $prevDepth
        Write-Host "SKIP orphan: $line"
        continue
    }

    # If we're about to start a new top-level block but depth > 0, insert missing }
    if ($prevDepth -gt 0 -and $opens -eq 0 -and $closes -eq 0 -and $line -match '^\.' -and $line -notmatch '^\s') {
        for ($i = 0; $i -lt $prevDepth; $i++) {
            $result.Add('}')
            Write-Host "INSERT } before: $line"
        }
        $depth = 0
    }

    $result.Add($line)
}

# Close any remaining open depth
for ($i = 0; $i -lt $depth; $i++) {
    $result.Add('}')
    Write-Host "INSERT } at end"
}

$fixed = $result -join "`n"
$ob2 = ($fixed.ToCharArray() | Where-Object {$_ -eq '{'}).Count
$cb2 = ($fixed.ToCharArray() | Where-Object {$_ -eq '}'}).Count
Write-Host "AFTER: open=$ob2 close=$cb2 balance=$($ob2-$cb2)"

[System.IO.File]::WriteAllText($f, $fixed)
Write-Host "Written. len=$($fixed.Length)"
