# MongoDB Setup Script for Windows (PowerShell)
# Run this script to check and set up MongoDB for testing

Write-Host "🚀 MongoDB Setup for Expense Management App" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Check if MongoDB is installed
$mongoPath = Get-Command mongod -ErrorAction SilentlyContinue

if (-not $mongoPath) {
    Write-Host "❌ MongoDB is not installed" -ForegroundColor Red
    Write-Host "📥 Please install MongoDB Community Server:" -ForegroundColor Yellow
    Write-Host "   Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host "   Or use Chocolatey: choco install mongodb" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MongoDB is installed at: $($mongoPath.Source)" -ForegroundColor Green

# Check if MongoDB service is running
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($mongoService -and $mongoService.Status -eq "Running") {
    Write-Host "✅ MongoDB service is running" -ForegroundColor Green
} else {
    Write-Host "🔄 Starting MongoDB service..." -ForegroundColor Yellow
    
    try {
        if ($mongoService) {
            Start-Service -Name "MongoDB"
            Write-Host "✅ MongoDB service started" -ForegroundColor Green
        } else {
            Write-Host "⚠️  MongoDB service not found. Starting manually..." -ForegroundColor Yellow
            
            # Create data directory if it doesn't exist
            $dataDir = ".\data\db"
            if (-not (Test-Path $dataDir)) {
                New-Item -ItemType Directory -Path $dataDir -Force
                Write-Host "📁 Created data directory: $dataDir" -ForegroundColor Blue
            }
            
            # Start MongoDB manually
            Start-Process -FilePath "mongod" -ArgumentList "--dbpath", $dataDir -WindowStyle Hidden
            Start-Sleep -Seconds 3
            Write-Host "✅ MongoDB started manually" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Failed to start MongoDB: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Try running as Administrator or start manually" -ForegroundColor Yellow
        exit 1
    }
}

# Test MongoDB connection
Write-Host "🧪 Testing MongoDB connection..." -ForegroundColor Blue

try {
    $testResult = & mongo --eval "db.runCommand('ping').ok" expense-management 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB connection successful" -ForegroundColor Green
        Write-Host "🗄️  Database: expense-management" -ForegroundColor Blue
        Write-Host "📡 Connection string: mongodb://localhost:27017/expense-management" -ForegroundColor Blue
    } else {
        throw "Connection test failed"
    }
} catch {
    Write-Host "❌ MongoDB connection failed" -ForegroundColor Red
    Write-Host "💡 Check if MongoDB is running on port 27017" -ForegroundColor Yellow
    Write-Host "💡 Try connecting manually: mongo" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Green
Write-Host "1. Update your .env file with: MONGODB_URI=mongodb://localhost:27017/expense-management" -ForegroundColor White
Write-Host "2. Run your Next.js server: npm run dev" -ForegroundColor White
Write-Host "3. Test the API endpoints using the test script: node test-api.js" -ForegroundColor White
Write-Host ""
Write-Host "📊 Monitor your database:" -ForegroundColor Blue
Write-Host "- MongoDB Compass: mongodb://localhost:27017" -ForegroundColor White
Write-Host "- Command line: mongo expense-management" -ForegroundColor White
Write-Host ""
Write-Host "🛠️  Useful MongoDB commands:" -ForegroundColor Blue
Write-Host "- Show databases: show dbs" -ForegroundColor White
Write-Host "- Use database: use expense-management" -ForegroundColor White
Write-Host "- Show collections: show collections" -ForegroundColor White
Write-Host "- View users: db.users.find().pretty()" -ForegroundColor White