# Git Branch Synchronization Commands

## 🔄 **Complete Branch Sync Workflow**

### **1. Check Current Status**
```bash
git status
git branch -a
git log --oneline --graph --all -10
```

### **2. Update Main Branch First**
```bash
git checkout main
git pull origin main
git add .
git commit -m "Sync main branch with latest changes"
git push origin main
```

### **3. Update All Branches**
```bash
# Get all remote branches
git fetch --all

# Update each branch with latest from main
for branch in $(git branch -r | grep -v HEAD | sed 's/.*\///'); do
    git checkout $branch
    git merge main --no-ff -m "Merge main into $branch"
    git push origin $branch
done

# Return to main
git checkout main
```

### **4. Handle Conflicts (if any)**
```bash
# If merge conflicts occur:
git status
git add .
git commit -m "Resolve merge conflicts"
git push origin current-branch-name
```

### **5. One-Command Sync (Advanced)**
```bash
# Sync all branches in one command
git checkout main && git pull && \
for branch in $(git branch -r | grep -v HEAD | sed 's/.*\///'); do \
    git checkout $branch && git merge main --no-ff && git push origin $branch; \
done && git checkout main
```

## 🐚 **PowerShell Sync Script**

### **Create PowerShell Script: sync-branches.ps1**
```powershell
# PowerShell Script to Sync All Git Branches
Write-Host "🔄 Starting Git Branch Synchronization..." -ForegroundColor Green

# Store current branch
$originalBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $originalBranch" -ForegroundColor Yellow

# Update main branch
Write-Host "📥 Updating main branch..." -ForegroundColor Blue
git checkout main
git pull origin main
git add .
git commit -m "Sync main branch with latest changes"
git push origin main

# Get all remote branches
$branches = git branch -r | ForEach-Object { $_.Trim() -replace "origin/", "" } | Where-Object { $_ -ne "HEAD" -and $_ -ne "main" }

# Update each branch
foreach ($branch in $branches) {
    Write-Host "🔄 Updating branch: $branch" -ForegroundColor Cyan
    git checkout $branch
    
    # Try to merge main into branch
    try {
        git merge main --no-ff -m "Merge main into $branch"
        git push origin $branch
        Write-Host "✅ Successfully updated: $branch" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Conflict in branch: $branch" -ForegroundColor Red
        Write-Host "🔧 Resolving conflicts..." -ForegroundColor Yellow
        git add .
        git commit -m "Resolve merge conflicts in $branch"
        git push origin $branch
    }
}

# Return to original branch
Write-Host "🔙 Returning to branch: $originalBranch" -ForegroundColor Yellow
git checkout $originalBranch

Write-Host "🎉 Branch synchronization complete!" -ForegroundColor Green
```

## 🚀 **Quick Sync Commands**

### **Safe Sync (Recommended)**
```bash
# Step 1: Update main
git checkout main && git pull origin main

# Step 2: Update specific branch
git checkout your-branch-name
git merge main
git push origin your-branch-name

# Step 3: Return to main
git checkout main
```

### **Force Sync (Use with caution)**
```bash
# Force update all branches to match main
git checkout main
git push origin main --force

for branch in $(git branch -r | grep -v HEAD | sed 's/.*\///'); do
    git checkout $branch
    git reset --hard origin/main
    git push origin $branch --force
done

git checkout main
```

## 📋 **Branch Consistency Check**

### **Check Branch Differences**
```bash
# Compare branches
git diff main..feature-branch --stat
git log main..feature-branch --oneline

# Check which branches are behind
for branch in $(git branch -r | grep -v HEAD | sed 's/.*\///'); do
    echo "=== $branch ==="
    git log main..$branch --oneline -5
done
```

## 🔧 **Maintenance Commands**

### **Clean Up Branches**
```bash
# Remove stale branches
git remote prune origin
git branch -d $(git branch --merged | grep -v "^\*")

# Update branch list
git fetch --all --prune
```

### **Set Upstream Tracking**
```bash
# Ensure all branches track remote correctly
for branch in $(git branch -r | grep -v HEAD | sed 's/.*\///'); do
    git branch --set-upstream-to=origin/$branch $branch 2>/dev/null || true
done
```

## 📝 **Usage Instructions**

1. **Save the PowerShell script** as `sync-branches.ps1`
2. **Run from PowerShell**: `.\sync-branches.ps1`
3. **Or use Git commands** individually based on your needs
4. **Commit any changes** before syncing

## ⚠️ **Important Notes**

- **Backup first**: Create a branch backup before force operations
- **Resolve conflicts manually**: Auto-resolve may not work for complex conflicts
- **Test after sync**: Ensure your application still works
- **Push changes**: Always push after resolving conflicts

## 🎯 **Recommended Workflow**

```bash
# Daily sync routine
git checkout main
git pull origin main
git add .
git commit -m "Daily sync - $(date)"
git push origin main

# Weekly branch cleanup
git remote prune origin
git branch -d $(git branch --merged | grep -v "^\*")
```
