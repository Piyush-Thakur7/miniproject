$taskName = "HermesDailyJobHunter"
$scriptPath = "c:\Users\HP\OneDrive\Pictures\Documents\Skills\Anti Gravity\scripts\run_daily_job_hunter.ps1"

try {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
} catch {}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At 9:00AM
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Description "Daily Part-Time Remote Job Finder via Hermes Agent"
Write-Host "? Successfully registered $taskName to run daily at 9:00 AM" -ForegroundColor Green
