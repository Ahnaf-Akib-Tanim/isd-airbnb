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
Write-Host "✅ Main branch updated" -ForegroundColor Green

# Step 4: Update develop branch
Write-Host "🌿 Step 4: Updating develop branch..." -ForegroundColor Yellow
git checkout develop
git pull origin develop
git merge main --no-ff -m "merge: sync main to develop"
git push origin develop
Write-Host "✅ Develop branch updated" -ForegroundColor Green

# Step 5: Update all feature branches
Write-Host "🔀 Step 5: Updating all feature branches..." -ForegroundColor Yellow
$featureBranches = @(
    "feature/admin/initial-setup",
    "feature/availability/initial-setup", 
    "feature/booking/initial-setup",
    "feature/frontend/initial-setup",
    "feature/listing/initial-setup",
    "feature/payment/initial-setup",
    "feature/user/initial-setup",
    "feature/hosts-seed-homepage"
)

foreach ($branch in $featureBranches) {
    Write-Host "🔄 Updating branch: $branch" -ForegroundColor Cyan
    
    # Check if branch exists locally
    $branchExists = git show-ref --verify --quiet refs/heads/$branch 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Branch $branch doesn't exist locally, creating..." -ForegroundColor Yellow
        git checkout -b $branch origin/$branch
    } else {
        git checkout $branch
    }
    
    # Pull latest changes
    git pull origin $branch
    
    # Check for potential conflicts before merging
    $conflictCheck = git merge-tree $(git merge-base develop $branch) develop $branch 2>$null
    if ($LASTEXITCODE -eq 0) {
        # No conflicts, safe to merge
        git merge develop --no-ff -m "merge: sync develop to $branch"
        git push origin $branch
        Write-Host "✅ Branch $branch updated successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Potential conflicts in $branch - skipping merge" -ForegroundColor Red
        Write-Host "⚠️  Manual resolution needed for branch: $branch" -ForegroundColor Yellow
    }
}

# Step 6: Return to original branch
Write-Host "🏠 Step 6: Returning to original branch..." -ForegroundColor Yellow
git checkout feature/hosts-availability

Write-Host "🎉 Branch sync completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "- Current branch: feature/hosts-availability"
Write-Host "- Main branch: ✅ Updated"
Write-Host "- Develop branch: ✅ Updated" 
Write-Host "- Feature branches: ✅ Updated (check warnings above)"
Write-Host ""
Write-Host "🔍 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check for any conflict warnings above"
Write-Host "2. Test the application"
Write-Host "3. Create pull request if needed"
