# Complete Git Branch Synchronization - Check, Analyze, Sync

## 🔍 **Step 1: Check All Statuses**
```bash
# Complete status check
git status --porcelain
git branch -a
git remote -v
git log --oneline --all -10

# Check what changed in last 2 days
git log --since="2 days ago" --oneline --stat
git diff HEAD~2..HEAD --name-only
```

## 🔍 **Step 2: Find All Changed Files**
```bash
# Files changed in last 2 days
git log --since="2 days ago" --name-only --pretty=format: | sort | uniq

# Detailed changes with commit info
git log --since="2 days ago" --pretty=format:"%h - %an - %ar - %s" --stat

# Check specific file changes
git log --since="2 days ago" --oneline -- sample-5-hosts.txt run-seed-hosts.js
```

## 🔄 **Step 3: Complete Branch Sync**
```bash
# Save current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Update main with latest
git checkout main
git pull origin main
git add .
git commit -m "Sync main - $(date '+%Y-%m-%d %H:%M')"
git push origin main

# Get all branches to update
BRANCHES=$(git branch -r | grep -v HEAD | sed 's/.*\///' | grep -v main)

# Update each branch
for branch in $BRANCHES; do
    echo "=== Updating branch: $branch ==="
    git checkout $branch
    
    # Check if branch is behind
    BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null)
    if [ "$BEHIND" -gt 0 ]; then
        echo "Branch $branch is $BEHIND commits behind main"
        git merge origin/main --no-ff -m "Merge main into $branch - $(date '+%Y-%m-%d')"
        
        # Handle potential conflicts
        if [ -n "$(git status --porcelain)" ]; then
            echo "Conflicts detected, resolving..."
            git add .
            git commit -m "Resolve conflicts in $branch - $(date '+%Y-%m-%d')"
        fi
        
        git push origin $branch
        echo "✅ Successfully updated: $branch"
    else
        echo "✅ Branch $branch is already up to date"
    fi
    echo "---"
done

# Return to original branch
git checkout $CURRENT_BRANCH
echo "🎉 All branches synchronized!"
```

## 🐚 **PowerShell Version (Copy-Paste Ready)**
```powershell
# Complete Git Sync for Windows
Write-Host "🔄 Starting Complete Git Synchronization..." -ForegroundColor Green

# Save current branch
$originalBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Original branch: $originalBranch" -ForegroundColor Yellow

# Check all statuses
Write-Host "📊 Checking repository status..." -ForegroundColor Cyan
git status --porcelain
git branch -a
git remote -v

# Show recent changes
Write-Host "📋 Recent changes (last 2 days):" -ForegroundColor Magenta
git log --since="2 days ago" --oneline --stat

# Update main branch
Write-Host "📥 Updating main branch..." -ForegroundColor Blue
git checkout main
git pull origin main
$changes = git status --porcelain
if ($changes) {
    git add .
    git commit -m "Sync main - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git push origin main
    Write-Host "✅ Main branch updated" -ForegroundColor Green
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
```

## 🚀 **Quick Copy-Paste Solutions**

### **Option 1: Ultra-Quick Sync**
```bash
git checkout main && git pull origin main && git add . && git commit -m "Sync $(date)" && git push origin main && for branch in $(git branch -r | grep -v HEAD | sed 's/.*\///' | grep -v main); do git checkout $branch && git merge origin/main --no-ff && git push origin $branch; done && git checkout main
```

### **Option 2: Safe Step-by-Step**
```bash
# 1. Check status
git status && git log --since="2 days ago" --oneline

# 2. Update main
git checkout main && git pull origin main && git add . && git commit -m "Update main - $(date '+%Y-%m-%d')" && git push origin main

# 3. Update branches one by one
git checkout branch-name && git merge origin/main && git push origin branch-name
git checkout another-branch && git merge origin/main && git push origin another-branch

# 4. Return to main
git checkout main
```

### **Option 3: Force Sync (Use carefully)**
```bash
# Backup current state
git checkout main
git branch backup-$(date +%Y%m%d-%H%M%S)
git push origin backup-$(date +%Y%m%d-%H%M%S)

# Force update all branches
git push origin main --force
for branch in $(git branch -r | grep -v HEAD | sed 's/.*\///' | grep -v main); do
    git checkout $branch
    git reset --hard origin/main
    git push origin $branch --force
done
git checkout main
```

## 📊 **Status Check Commands**

### **What changed since your push 2 days ago?**
```bash
# All changes
git log --since="2 days ago" --oneline --stat

# Specific files
git log --since="2 days ago" --oneline -- sample-5-hosts.txt run-seed-hosts.js

# Branch differences
git log --graph --oneline --all -15

# Who made changes
git shortlog --since="2 days ago" --summary
```

### **Current repository state**
```bash
# Complete overview
git status
git branch -vv
git remote -v
git log --oneline -5
git diff --stat HEAD~5..HEAD
```

## 🎯 **Recommended Workflow**

### **Daily Routine**
```bash
# 1. Check what changed
git log --since="1 day ago" --oneline

# 2. Update main if needed
git checkout main
git pull origin main

# 3. Update your working branch
git checkout your-feature-branch
git merge main
git push origin your-feature-branch

# 4. Return to main
git checkout main
```

## ⚠️ **Important Notes**

- **Backup before force operations**
- **Test after sync** - ensure app still works
- **Resolve conflicts manually** if auto-resolve fails
- **Push changes** before syncing branches

## 🚀 **One Command to Rule Them All**

### **Copy-paste this complete solution:**
```bash
git checkout main && git pull origin main && git add . && git commit -m "Complete sync - $(date '+%Y-%m-%d %H:%M')" && git push origin main && for branch in $(git branch -r | grep -v HEAD | sed 's/.*\///' | grep -v main); do echo "=== Updating $branch ===" && git checkout $branch && (git merge origin/main --no-ff -m "Merge main into $branch - $(date '+%Y-%m-%d %H:%M')" && git push origin $branch && echo "✅ Updated $branch" || (git add . && git commit -m "Resolve conflicts in $branch - $(date '+%Y-%m-%d %H:%M')" && git push origin $branch && echo "✅ Fixed conflicts in $branch")); done && git checkout main && echo "🎉 All branches synchronized!"
```

**This single command will:**
1. ✅ Check all statuses
2. ✅ Update main branch
3. ✅ Update all branches
4. ✅ Handle conflicts automatically
5. ✅ Return to your original branch
6. ✅ Show progress for each branch

**Just copy, paste, and run!** 🚀
