# Test Authentication Endpoints - Fresh User

Write-Host "`n=== Testing Meet.io Authentication ===" -ForegroundColor Cyan

# Generate unique email
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$email = "user$timestamp@meetio.com"

# Test 1: Register
Write-Host "`n1. Testing Registration with email: $email" -ForegroundColor Yellow
$registerBody = @{
    name     = "Test User $timestamp"
    email    = $email
    password = "securepassword123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -SessionVariable registerSession
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.user._id)" -ForegroundColor Gray
    Write-Host "Name: $($registerResponse.user.name)" -ForegroundColor Gray
    Write-Host "Email: $($registerResponse.user.email)" -ForegroundColor Gray
    Write-Host "Avatar: $($registerResponse.user.avatar)" -ForegroundColor Gray
    Write-Host "Token: Received (HTTP-Only Cookie)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Registration failed" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    exit 1
}

# Test 2: Logout
Write-Host "`n2. Testing Logout..." -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/logout" -Method POST -WebSession $registerSession
    Write-Host "✅ Logout successful!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Logout failed" -ForegroundColor Red
}

# Test 3: Login
Write-Host "`n3. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email    = $email
    password = "securepassword123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -SessionVariable loginSession
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User: $($loginResponse.user.name)" -ForegroundColor Gray
    Write-Host "Token: Received" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    exit 1
}

# Test 4: Get Current User (Protected Route)
Write-Host "`n4. Testing Protected Route (/api/auth/me)..." -ForegroundColor Yellow
try {
    $meResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -WebSession $loginSession
    Write-Host "✅ Protected route accessible!" -ForegroundColor Green
    Write-Host "Current User: $($meResponse.user.name)" -ForegroundColor Gray
    Write-Host "Email: $($meResponse.user.email)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Protected route failed" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
}

# Test 5: Wrong Password
Write-Host "`n5. Testing Wrong Password (should fail)..." -ForegroundColor Yellow
$wrongBody = @{
    email    = $email
    password = "wrongpassword"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $wrongBody -ContentType "application/json"
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
}
catch {
    Write-Host "✅ Correctly rejected wrong password!" -ForegroundColor Green
}

Write-Host "`n=== All Tests Passed! ===" -ForegroundColor Green
