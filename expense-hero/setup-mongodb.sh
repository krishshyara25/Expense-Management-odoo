#!/bin/bash

# MongoDB Setup Script for Testing
# This script helps set up a local MongoDB instance for testing

echo "🚀 MongoDB Setup for Expense Management App"
echo "============================================"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed"
    echo "📥 Please install MongoDB:"
    echo "   - Windows: Download from https://www.mongodb.com/try/download/community"
    echo "   - macOS: brew install mongodb-community"
    echo "   - Ubuntu: sudo apt install mongodb"
    exit 1
fi

echo "✅ MongoDB is installed"

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is already running"
else
    echo "🔄 Starting MongoDB..."
    
    # Try to start MongoDB (adjust path as needed)
    if command -v brew &> /dev/null; then
        # macOS with Homebrew
        brew services start mongodb-community
    elif command -v systemctl &> /dev/null; then
        # Linux with systemd
        sudo systemctl start mongod
    else
        # Manual start
        mongod --dbpath ./data/db &
    fi
    
    sleep 3
    
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB started successfully"
    else
        echo "❌ Failed to start MongoDB"
        echo "💡 Try running manually: mongod --dbpath ./data/db"
        exit 1
    fi
fi

# Test connection
echo "🧪 Testing MongoDB connection..."
mongo --eval "db.runCommand('ping').ok" expense-management > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ MongoDB connection successful"
    echo "🗄️  Database: expense-management"
    echo "📡 Connection string: mongodb://localhost:27017/expense-management"
else
    echo "❌ MongoDB connection failed"
    echo "💡 Check if MongoDB is running on default port 27017"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Update your .env file with: MONGODB_URI=mongodb://localhost:27017/expense-management"
echo "2. Run your Next.js server: npm run dev"
echo "3. Test the API endpoints"
echo ""
echo "📊 Monitor your database:"
echo "- MongoDB Compass: mongodb://localhost:27017"
echo "- Command line: mongo expense-management"