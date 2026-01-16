# Test Script for YouTube Downloader

Write-Host "=== Testing YouTube Downloader Backend ===" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "[OK] Backend is healthy" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "[FAIL] Backend health check failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "  Make sure backend is running: npm run backend:start" -ForegroundColor Yellow
    exit 1
}

# Test 2: Get Video Info
Write-Host "Test 2: Get Video Info" -ForegroundColor Cyan
$testUrl = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
$body = @{
    url = $testUrl
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/video-info" -Method POST -Body $body -ContentType "application/json"
    Write-Host "[OK] Video info retrieved successfully" -ForegroundColor Green
    Write-Host "  Title: $($response.title)" -ForegroundColor Gray
    Write-Host "  Uploader: $($response.uploader)" -ForegroundColor Gray
    Write-Host "  Duration: $($response.duration) seconds" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "[FAIL] Failed to get video info" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
}

# Test 3: List Downloads
Write-Host "Test 3: List Downloads" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/downloads" -Method GET
    Write-Host "[OK] Downloads list retrieved" -ForegroundColor Green
    Write-Host "  Total files: $($response.files.Count)" -ForegroundColor Gray
    if ($response.files.Count -gt 0) {
        Write-Host "  Recent files:" -ForegroundColor Gray
        $response.files | Select-Object -First 5 | ForEach-Object {
            Write-Host "    - $($_.filename)" -ForegroundColor DarkGray
        }
    }
    Write-Host ""
} catch {
    Write-Host "[FAIL] Failed to list downloads" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "=== Test Summary ===" -ForegroundColor Green
Write-Host "Backend API: Running on http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend UI: Running on http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test downloads:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor Gray
Write-Host "2. Paste a YouTube URL" -ForegroundColor Gray
Write-Host "3. Click Get Info to preview" -ForegroundColor Gray
Write-Host "4. Click Download Video or Download Audio" -ForegroundColor Gray
Write-Host "5. Check backend/downloads folder for files" -ForegroundColor Gray
Write-Host ""
