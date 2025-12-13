# Test Meeting API Endpoints

Write-Host "`n=== Testing Meeting API ===" -ForegroundColor Cyan

# First, login to get session
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
    Write-Host "❌ Login failed. Please register first!" -ForegroundColor Red
    exit 1
}

# Test 1: Create Meeting
Write-Host "`n2. Creating a new meeting..." -ForegroundColor Yellow
$createBody = @{
    title = "Team Standup"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/meetings" -Method POST -Body $createBody -ContentType "application/json" -WebSession $session
    Write-Host "✅ Meeting created!" -ForegroundColor Green
    Write-Host "Title: $($createResponse.meeting.title)" -ForegroundColor Gray
    Write-Host "Code: $($createResponse.meeting.code)" -ForegroundColor Green
    Write-Host "Host: $($createResponse.meeting.hostId.name)" -ForegroundColor Gray
    $meetingCode = $createResponse.meeting.code
    $meetingId = $createResponse.meeting._id
}
catch {
    Write-Host "❌ Create meeting failed" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    exit 1
}

# Test 2: Join Meeting
Write-Host "`n3. Joining meeting with code: $meetingCode" -ForegroundColor Yellow
$joinBody = @{
    code = $meetingCode
} | ConvertTo-Json

try {
    $joinResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/meetings/join" -Method POST -Body $joinBody -ContentType "application/json" -WebSession $session
    Write-Host "✅ Joined meeting successfully!" -ForegroundColor Green
    Write-Host "Participants: $($joinResponse.meeting.participants.Count)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Join meeting failed" -ForegroundColor Red
}

# Test 3: Get Meeting
Write-Host "`n4. Getting meeting details..." -ForegroundColor Yellow
try {
    $getMeeting = Invoke-RestMethod -Uri "http://localhost:5000/api/meetings/$meetingId" -Method GET -WebSession $session
    Write-Host "✅ Retrieved meeting details!" -ForegroundColor Green
    Write-Host "ID: $($getMeeting.meeting._id)" -ForegroundColor Gray
    Write-Host "Active: $($getMeeting.meeting.isActive)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Get meeting failed" -ForegroundColor Red
}

# Test 4: Get My Meetings
Write-Host "`n5. Getting my meetings..." -ForegroundColor Yellow
try {
    $myMeetings = Invoke-RestMethod -Uri "http://localhost:5000/api/meetings/my" -Method GET -WebSession $session
    Write-Host "✅ Retrieved $($myMeetings.count) meetings!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Get my meetings failed" -ForegroundColor Red
}

# Test 5: Invalid Code
Write-Host "`n6. Testing invalid code (should fail)..." -ForegroundColor Yellow
$badCode = @{
    code = "XXX-YYY-ZZZ"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/meetings/join" -Method POST -Body $badCode -ContentType "application/json" -WebSession $session
    Write-Host "❌ Should have failed!" -ForegroundColor Red
}
catch {
    Write-Host "✅ Correctly rejected invalid code!" -ForegroundColor Green
}

Write-Host "`n=== All Meeting API Tests Complete! ===" -ForegroundColor Green
