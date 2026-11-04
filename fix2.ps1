$f = 'c:\Users\alsye\Documents\Codex\2026-10-10\b\src\app\globals.css'
$css = [System.IO.File]::ReadAllText($f)

# Remove the orphaned @media(min-width:1101px) block - multiline version
$css = $css -replace '(?s)@media\(min-width:1101px\)\s*\{.*?\}', ''

# Also remove any orphaned lines that are just the leftover inner rules + closing brace
# Pattern: lines with only .desktop-nav grid-column/brand-lockup/header-actions grid-column followed by lone }
$css = $css -replace '(?m)^\s*\.desktop-nav\{grid-column:1;grid-row:1[^\}]+\}\s*\n', ''
$css = $css -replace '(?m)^\s*\.brand-lockup\{grid-column:2[^\}]+\}\s*\n', ''
$css = $css -replace '(?m)^\s*\.header-actions\{grid-column:3;grid-row:1[^\}]+\}\s*\n', ''

# Remove any lone } that follows the story-opening-copy rule (the orphaned closing brace)
# Find the exact orphaned fragment and remove it
$orphan = "  .desktop-nav{grid-column:1;grid-row:1;justify-self:start;gap:clamp(16px,2vw,30px)}"
$css = $css.Replace($orphan, '')
$orphan2 = "  .header-actions{grid-column:3;grid-row:1;justify-self:end;gap:clamp(16px,2vw,30px)}"
$css = $css.Replace($orphan2, '')

# Now find and remove the lone } between story-opening-copy and /* Default */
$css = $css -replace '(?s)(\.story-opening-copy\{max-width:600px;margin:0\}\s*\n@media[^\}]+\}\s*\n)\s*\n\s*\}\s*\n', '$1'

# Simpler: just remove the specific orphaned block
$target = "`n  .desktop-nav{grid-column:1;grid-row:1;justify-self:start;gap:clamp(16px,2vw,30px)}`n  `n  .header-actions{grid-column:3;grid-row:1;justify-self:end;gap:clamp(16px,2vw,30px)}`n}"
$css = $css.Replace($target, '')

[System.IO.File]::WriteAllText($f, $css)

# Verify
$lines = $css -split "`n"
for($i=495; $i -le [Math]::Min(510, $lines.Count-1); $i++){
  Write-Host "$($i+1): $($lines[$i])"
}
