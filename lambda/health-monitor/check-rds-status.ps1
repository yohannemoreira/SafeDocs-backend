Write-Host "Checking RDS status..." -ForegroundColor Yellow

do {
    $status = aws rds describe-db-instances --db-instance-identifier safedocs-db --query 'DBInstances[0].DBInstanceStatus' --output text
    $endpoint = aws rds describe-db-instances --db-instance-identifier safedocs-db --query 'DBInstances[0].Endpoint.Address' --output text
    
    Write-Host "Status: $status" -ForegroundColor Cyan
    
    if ($status -eq "available") {
        Write-Host "RDS is ready!" -ForegroundColor Green
        Write-Host "Endpoint: $endpoint" -ForegroundColor White
        Write-Host ""
        Write-Host "Connection details:" -ForegroundColor Yellow
        Write-Host "Host: $endpoint"
        Write-Host "Port: 5432"
        Write-Host "Database: safedocs_db"
        Write-Host "Username: safedocs_user"
        Write-Host "Password: SafeDocs2025!"
        Write-Host ""
        Write-Host "Update your .env file:" -ForegroundColor Yellow
        Write-Host "DB_HOST=$endpoint"
        Write-Host "DB_PORT=5432"
        Write-Host "DB_USERNAME=safedocs_user"
        Write-Host "DB_PASSWORD=SafeDocs2025!"
        Write-Host "DB_DATABASE=safedocs_db"
        break
    } elseif ($status -eq "failed") {
        Write-Host "RDS creation failed!" -ForegroundColor Red
        break
    } else {
        Write-Host "Still creating... waiting 30 seconds" -ForegroundColor Yellow
        Start-Sleep -Seconds 30
    }
} while ($true)
