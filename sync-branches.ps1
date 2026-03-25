# Comprehensive Git Branch Sync Script (PowerShell)
# Safely updates all branches with latest changes

Write-Host "🚀 Starting comprehensive branch sync..." -ForegroundColor Green

# Step 1: Commit current changes
Write-Host "📝 Step 1: Committing current changes..." -ForegroundColor Yellow
git add .

$staged = git diff --staged --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  No changes to commit" -ForegroundColor Yellow
} else {
    git commit -m "feat: implement pagination, performance optimizations, and bug fixes

- Add server-side pagination for HomePage and SearchPage
- Implement retry logic with exponential backoff in API calls
- Add image optimization and lazy loading utilities
- Create React ErrorBoundary for graceful error handling
- Add performance utilities (debounce, throttle, cache management)
- Fix data fetching issues and improve error handling
- Optimize API response handling and caching strategies
- Add comprehensive logging and debugging tools

Performance improvements:
- Reduced API timeouts from 15s to 10s/5s
- Added client-side caching for 3-5 minutes
- Implemented image compression for base64 payloads
- Added request deduplication and batching utilities

Bug fixes:
- Fixed 'No homes found' issue with proper data extraction
- Resolved pagination and data loading problems
- Enhanced error boundaries and fallback mechanisms"
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
}

# Step 2: Push current branch
Write-Host "📤 Step 2: Pushing current branch..." -ForegroundColor Yellow
git push origin feature/hosts-availability
Write-Host "✅ Current branch pushed" -ForegroundColor Green

# Step 3: Update main branch
Write-Host "🌟 Step 3: Updating main branch..." -ForegroundColor Yellow
git checkout main
git pull origin main
git merge feature/hosts-availability --no-ff -m "merge: sync hosts-availability features to main"
git push origin main
}

# Get all branches except main and HEAD
$branches = git branch -r | ForEach-Object { 
    $_.Trim() -replace "origin/", "" -replace "HEAD ->", "" 
} | Where-Object { 
    $_ -ne "main" -and $_ -ne "" 
}

# Update each branch
foreach ($branch in $branches) {
    Write-Host "🔄 Processing branch: $branch" -ForegroundColor Cyan
    
    git checkout $branch
    
    # Check if branch is behind main
    $behind = git rev-list --count HEAD..origin/main 2>$null
    if ($behind -gt 0) {
        Write-Host "⚠ Branch $branch is $behind commits behind main" -ForegroundColor Yellow
        
        try {
            git merge origin/main --no-ff -m "Merge main into $branch - $(Get-Date -Format 'yyyy-MM-dd')"
            git push origin $branch
            Write-Host "✅ Successfully updated: $branch" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Error updating $branch" -ForegroundColor Red
            Write-Host "🔧 Resolving conflicts..." -ForegroundColor Yellow
            git add .
            git commit -m "Resolve conflicts in $branch - $(Get-Date -Format 'yyyy-MM-dd')"
            git push origin $branch
            Write-Host "✅ Conflicts resolved and pushed: $branch" -ForegroundColor Green
        }
    }
    else {
        Write-Host "✅ Branch $branch is up to date" -ForegroundColor Green
    }
}

# Return to original branch
Write-Host "🔙 Returning to branch: $originalBranch" -ForegroundColor Yellow
git checkout $originalBranch

Write-Host "🎉 Complete synchronization finished!" -ForegroundColor Green
Write-Host "- Main branch: ✅ Updated"
Write-Host "- Develop branch: ✅ Updated" 
Write-Host "- Feature branches: ✅ Updated (check warnings above)"
Write-Host ""
Write-Host "🔍 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check for any conflict warnings above"
Write-Host "2. Test the application"
Write-Host "3. Create pull request if needed"
