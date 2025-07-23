# Script para trocar ambiente da Lambda
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "localtunnel", "production")]
    [string]$Environment
)

$urls = @{
    "local" = "http://localhost:3000"
    "localtunnel" = "https://safedocs-test.loca.lt" 
}

$url = $urls[$Environment]

Write-Host "Switching Lambda environment to: $Environment" -ForegroundColor Green
Write-Host "API URL: $url" -ForegroundColor Cyan

aws lambda update-function-configuration --function-name safedocs-health-monitor --environment Variables="{API_BASE_URL=$url,NODE_ENV=$Environment}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Environment updated successfully!" -ForegroundColor Green
    
    # Testar funcao
    Write-Host "Testing function..." -ForegroundColor Yellow
    aws lambda invoke --function-name safedocs-health-monitor --payload "{}" test-response.json
    
    Write-Host "Test result:" -ForegroundColor Cyan
    Get-Content test-response.json
    
    Remove-Item test-response.json -ErrorAction SilentlyContinue
} else {
    Write-Host "Environment update failed!" -ForegroundColor Red
}
