# Test LiveKit Token Generation

Write-Host "`n=== Testing LiveKit Integration ===" -ForegroundColor Cyan

# Step 1: Login
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email    = "demo@meetio.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -SessionVariable session
    Write-Host "✅ Logged in as: $($loginResponse.user.name)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
    exit 1
}

# Step 2: Create a meeting
Write-Host "`n2. Creating a meeting..." -ForegroundColor Yellow
$createBody = @{
    title = "LiveKit Test Meeting"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/meetings" -Method POST -Body $createBody -ContentType "application/json" -WebSession $session
    Write-Host "✅ Meeting created!" -ForegroundColor Green
    Write-Host "Code: $($createResponse.meeting.code)" -ForegroundColor Gray
    $meetingCode = $createResponse.meeting.code
}
catch {
    Write-Host "❌ Create failed" -ForegroundColor Red
    exit 1
}

# Step 3: Join meeting and get LiveKit token
Write-Host "`n3. Joining meeting to get LiveKit token..." -ForegroundColor Yellow
$joinBody = @{
    code = $meetingCode
} | ConvertTo-Json

try {
    $joinResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/meetings/join" -Method POST -Body $joinBody -ContentType "application/json" -WebSession $session
    Write-Host "✅ Joined meeting successfully!" -ForegroundColor Green
    
    # Check if LiveKit token is present
    if ($joinResponse.livekit) {
        Write-Host "`n🎥 LiveKit Integration Details:" -ForegroundColor Cyan
        Write-Host "URL: $($joinResponse.livekit.url)" -ForegroundColor Green
        
        $token = $joinResponse.livekit.token
        Write-Host "Token: $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Green
        Write-Host "Token Length: $($token.Length) characters" -ForegroundColor Gray
        
        # Verify token format (JWT should have 3 parts separated by dots)
        $parts = $token -split '\.'
        if ($parts.Count -eq 3) {
            Write-Host "✅ Token format valid (JWT with 3 parts)" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Token format invalid" -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ No LiveKit data in response!" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Join failed" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
}

Write-Host "`n=== LiveKit Integration Test Complete! ===" -ForegroundColor Green
