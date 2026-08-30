$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$pythonScript = Join-Path $scriptDir "hermes_job_applier.py"

Write-Host "?? Starting Hermes Daily Job Hunter..." -ForegroundColor Cyan
python "$pythonScript"
