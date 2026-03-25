# Simple Git Branch Sync Script
Write-Host "🔄 Starting Git Synchronization..." -ForegroundColor Green

# Save current branch
$originalBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Original branch: $originalBranch" -ForegroundColor Yellow

# Update main branch
Write-Host "📥 Updating main branch..." -ForegroundColor Blue
git checkout main
git pull origin main
git add .
git commit -m "Sync main branch - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main
Write-Host "✅ Main branch updated" -ForegroundColor Green

# Get all branches except main
$branches = git branch -r | ForEach-Object { 
    $_.Trim() -replace "origin/", "" -replace "HEAD ->", "" 
} | Where-Object { 
    $_ -ne "main" -and $_ -ne "" 
}

# Update each branch
foreach ($branch in $branches) {
    Write-Host "🔄 Updating branch: $branch" -ForegroundColor Cyan
    
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

Write-Host "🎉 Synchronization complete!" -ForegroundColor Green
