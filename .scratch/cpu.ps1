$a = @{}
Get-Process chrome -ErrorAction SilentlyContinue | ForEach-Object { $a[$_.Id] = $_.CPU }
Start-Sleep -Seconds 10
Get-Process chrome -ErrorAction SilentlyContinue | Sort-Object CPU -Descending | Select-Object -First 5 | ForEach-Object {
  $prev = 0
  if ($a.ContainsKey($_.Id)) { $prev = $a[$_.Id] }
  "{0}  dCPU={1:N1}s/10s  ws={2:N0}MB" -f $_.Id, ($_.CPU - $prev), ($_.WorkingSet64 / 1MB)
}
