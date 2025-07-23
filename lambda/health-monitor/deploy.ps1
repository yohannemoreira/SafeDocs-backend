Write-Host "Deploying SafeDocs Health Monitor Lambda..." -ForegroundColor Green

# Criar ZIP
Write-Host "Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "function.zip") {
    Remove-Item "function.zip"
}

Compress-Archive -Path "index.js", "package.json" -DestinationPath "function.zip" -Force

# Atualizar funcao existente
Write-Host "Updating Lambda function..." -ForegroundColor Cyan
aws lambda update-function-code --function-name safedocs-health-monitor --zip-file fileb://function.zip

# Atualizar variavel de ambiente para localtunnel
Write-Host "Updating environment variables..." -ForegroundColor Yellow
aws lambda update-function-configuration --function-name safedocs-health-monitor --environment Variables="{API_BASE_URL=https://safedocs-test.loca.lt}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Lambda updated successfully!" -ForegroundColor Green
    
    # Testar funcao
    Write-Host "Testing function..." -ForegroundColor Yellow
    aws lambda invoke --function-name safedocs-health-monitor --payload "{}" test-response.json
    
    Write-Host "Test result:" -ForegroundColor Cyan
    Get-Content test-response.json
    
    Remove-Item test-response.json -ErrorAction SilentlyContinue
} else {
    Write-Host "Lambda update failed!" -ForegroundColor Red
}

# Limpar
Remove-Item "function.zip" -ErrorAction SilentlyContinue

Write-Host "Deployment completed!" -ForegroundColor Green