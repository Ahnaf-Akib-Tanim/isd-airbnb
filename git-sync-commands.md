# 🚀 Git Sync Commands - Step by Step

## 📋 Quick Commands (Run in Order)

### Step 1: Commit Current Changes
```bash
git add .
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
```

### Step 2: Push Current Branch
```bash
git push origin feature/hosts-availability
```

### Step 3: Update Main Branch
```bash
git checkout main
git pull origin main
git merge feature/hosts-availability --no-ff
git push origin main
```

### Step 4: Update Develop Branch
```bash
git checkout develop
git pull origin develop
git merge main --no-ff
git push origin develop
```

### Step 5: Update Feature Branches (Run these one by one)

#### Admin Setup
```bash
git checkout feature/admin/initial-setup
git pull origin feature/admin/initial-setup
git merge develop --no-ff
git push origin feature/admin/initial-setup
```

#### Availability Setup
```bash
git checkout feature/availability/initial-setup
git pull origin feature/availability/initial-setup
git merge develop --no-ff
git push origin feature/availability/initial-setup
```

#### Booking Setup
```bash
git checkout feature/booking/initial-setup
git pull origin feature/booking/initial-setup
git merge develop --no-ff
git push origin feature/booking/initial-setup
```

#### Frontend Setup
```bash
git checkout feature/frontend/initial-setup
git pull origin feature/frontend/initial-setup
git merge develop --no-ff
git push origin feature/frontend/initial-setup
```

#### Listing Setup
```bash
git checkout feature/listing/initial-setup
git pull origin feature/listing/initial-setup
git merge develop --no-ff
git push origin feature/listing/initial-setup
```

#### Payment Setup
```bash
git checkout feature/payment/initial-setup
git pull origin feature/payment/initial-setup
git merge develop --no-ff
git push origin feature/payment/initial-setup
```

#### User Setup
```bash
git checkout feature/user/initial-setup
git pull origin feature/user/initial-setup
git merge develop --no-ff
git push origin feature/user/initial-setup
```

#### Hosts Seed Homepage
```bash
git checkout feature/hosts-seed-homepage
git pull origin feature/hosts-seed-homepage
git merge develop --no-ff
git push origin feature/hosts-seed-homepage
```

### Step 6: Return to Original Branch
```bash
git checkout feature/hosts-availability
```

---

## 🛡️ Conflict Resolution Commands

### If Merge Conflicts Occur:
```bash
# Check what files have conflicts
git status

# View conflicts in a file
git diff --name-only --diff-filter=U

# Abort merge if too complex
git merge --abort

# Continue after resolving conflicts
git add .
git commit -m "resolve: merge conflicts in [branch-name]"
```

### Force Push (Last Resort):
```bash
git push origin [branch-name] --force-with-lease
```

---

## 🚀 Automated Script Options

### Option 1: PowerShell Script
```powershell
.\sync-branches.ps1
```

### Option 2: Bash Script (if using Git Bash)
```bash
./sync-branches.sh
```

---

## 📊 Verification Commands

### Check Branch Status After Sync
```bash
git branch -vv
git log --oneline -3
git status
```

### Verify Remote Sync
```bash
git remote show origin
```

---

## ⚠️ Important Notes

1. **Backup First**: Make sure you have a backup of your work
2. **Test After Sync**: Run the application after syncing
3. **Resolve Conflicts**: Address any conflicts immediately
4. **Network Connection**: Ensure stable internet during sync
5. **Git Credentials**: Have your Git credentials ready

---

## 🎯 Expected Outcome

After running these commands:
- ✅ All branches will be up-to-date
- ✅ Your latest changes will be in main/develop
- ✅ No merge conflicts (if successful)
- ✅ Consistent codebase across all branches
- ✅ Remote branches synchronized with local
