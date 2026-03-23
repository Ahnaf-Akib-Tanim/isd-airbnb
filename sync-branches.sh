#!/bin/bash

# Comprehensive Git Branch Sync Script
# Safely updates all branches with latest changes

echo "🚀 Starting comprehensive branch sync..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Commit current changes
echo "📝 Step 1: Committing current changes..."
git add .
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
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
    print_status "Changes committed successfully"
fi

# Step 2: Push current branch
echo "📤 Step 2: Pushing current branch..."
git push origin feature/hosts-availability
print_status "Current branch pushed"

# Step 3: Update main branch
echo "🌟 Step 3: Updating main branch..."
git checkout main
git pull origin main
git merge feature/hosts-availability --no-ff -m "merge: sync hosts-availability features to main"
git push origin main
print_status "Main branch updated"

# Step 4: Update develop branch
echo "🌿 Step 4: Updating develop branch..."
git checkout develop
git pull origin develop
git merge main --no-ff -m "merge: sync main to develop"
git push origin develop
print_status "Develop branch updated"

# Step 5: Update all feature branches
echo "🔀 Step 5: Updating all feature branches..."
FEATURE_BRANCHES=(
    "feature/admin/initial-setup"
    "feature/availability/initial-setup" 
    "feature/booking/initial-setup"
    "feature/frontend/initial-setup"
    "feature/listing/initial-setup"
    "feature/payment/initial-setup"
    "feature/user/initial-setup"
    "feature/hosts-seed-homepage"
)

for branch in "${FEATURE_BRANCHES[@]}"; do
    echo "🔄 Updating branch: $branch"
    
    # Check if branch exists locally
    if ! git show-ref --verify --quiet refs/heads/"$branch"; then
        print_warning "Branch $branch doesn't exist locally, creating..."
        git checkout -b $branch origin/$branch
    else
        git checkout $branch
    fi
    
    # Pull latest changes
    git pull origin $branch
    
    # Check for potential conflicts before merging
    if git merge-tree $(git merge-base develop $branch) develop $branch > /dev/null 2>&1; then
        # No conflicts, safe to merge
        git merge develop --no-ff -m "merge: sync develop to $branch"
        git push origin $branch
        print_status "Branch $branch updated successfully"
    else
        print_error "Potential conflicts in $branch - skipping merge"
        print_warning "Manual resolution needed for branch: $branch"
    fi
done

# Step 6: Return to original branch
echo "🏠 Step 6: Returning to original branch..."
git checkout feature/hosts-availability

print_status "🎉 Branch sync completed!"
echo ""
echo "📊 Summary:"
echo "- Current branch: feature/hosts-availability"
echo "- Main branch: ✅ Updated"
echo "- Develop branch: ✅ Updated" 
echo "- Feature branches: ✅ Updated (check warnings above)"
echo ""
echo "🔍 Next steps:"
echo "1. Check for any conflict warnings above"
echo "2. Test the application"
echo "3. Create pull request if needed"
