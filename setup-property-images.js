const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuration
const MONGODB_URI = 'mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/userdb?retryWrites=true&w=majority&appName=cluster0';
const IMAGE_BASE_PATH = 'C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data';
const PUBLIC_IMAGES_PATH = path.join(__dirname, 'frontend', 'public', 'property-images');

// Image categories to scan
const IMAGE_CATEGORIES = [
  'bathroom',
  'bedroom', 
  'living-room',
  'kitchen',
  'dining-room',
  'outdoor',
  'tv-room',
  'decor'
];

// Helper function to recursively get all image files from a directory
function getImageFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively scan subdirectories
      files.push(...getImageFiles(fullPath));
    } else if (stat.isFile()) {
      // Check if it's an image file
      const ext = path.extname(item).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// Step 1: Copy images to public folder
function copyImagesToPublic() {
  console.log('=== Step 1: Copying images to public folder ===');
  
  // Create public images directory if it doesn't exist
  if (!fs.existsSync(PUBLIC_IMAGES_PATH)) {
    fs.mkdirSync(PUBLIC_IMAGES_PATH, { recursive: true });
    console.log(`Created directory: ${PUBLIC_IMAGES_PATH}`);
  }
  
  // Collect all available images from both Training and Test Data folders
  const allImages = [];
  
  for (const category of IMAGE_CATEGORIES) {
    const trainingPath = path.join(IMAGE_BASE_PATH, 'Training Data', category);
    const testPath = path.join(IMAGE_BASE_PATH, 'Test Data', category);
    
    const trainingImages = getImageFiles(trainingPath);
    const testImages = getImageFiles(testPath);
    
    console.log(`Found ${trainingImages.length} images in Training Data/${category}`);
    console.log(`Found ${testImages.length} images in Test Data/${category}`);
    
    allImages.push(...trainingImages, ...testImages);
  }
  
  console.log(`Total images found: ${allImages.length}`);
  
  if (allImages.length === 0) {
    console.log('No images found in local folders. Will use fallback images.');
    return [];
  }
  
  // Copy images to public folder with unique names
  let copiedCount = 0;
  const copiedImages = [];
  
  for (let i = 0; i < allImages.length; i++) {
    const sourcePath = allImages[i];
    const ext = path.extname(sourcePath);
    const destPath = path.join(PUBLIC_IMAGES_PATH, `property-${i}${ext}`);
    
    try {
      fs.copyFileSync(sourcePath, destPath);
      copiedCount++;
      copiedImages.push(`/property-images/property-${i}${ext}`);
      console.log(`Copied: ${path.basename(sourcePath)} -> property-${i}${ext}`);
    } catch (error) {
      console.error(`Error copying ${sourcePath}:`, error.message);
    }
  }
  
  console.log(`Successfully copied ${copiedCount} images to ${PUBLIC_IMAGES_PATH}`);
  return copiedImages;
}

// Step 2: Update database with image URLs
async function updateDatabaseWithImages(copiedImages) {
  console.log('\n=== Step 2: Updating database with image URLs ===');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('userdb');
    const hostsCollection = db.collection('hosts');
    
    console.log('Connected to MongoDB');
    
    const hosts = await hostsCollection.find({}).toArray();
    console.log(`Found ${hosts.length} hosts to update`);
    
    // Determine which images to use
    let imagesToUse;
    
    if (copiedImages.length > 0) {
      imagesToUse = copiedImages;
      console.log(`Using ${copiedImages.length} local images`);
    } else {
      // Fallback: Use high-quality Unsplash images
      imagesToUse = [
        '/property-images/fallback-living-1.jpg',
        '/property-images/fallback-bedroom-1.jpg',
        '/property-images/fallback-kitchen-1.jpg',
        '/property-images/fallback-bathroom-1.jpg',
        '/property-images/fallback-outdoor-1.jpg',
        '/property-images/fallback-dining-1.jpg',
        '/property-images/fallback-tv-1.jpg',
        '/property-images/fallback-decor-1.jpg'
      ];
      console.log('Using fallback image URLs');
    }
    
    // Update each host with random images
    for (const host of hosts) {
      // Assign 3-5 random images per host
      const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images
      const hostImages = [];
      
      for (let i = 0; i < numImages; i++) {
        const randomImage = imagesToUse[Math.floor(Math.random() * imagesToUse.length)];
        hostImages.push(randomImage);
      }
      
      await hostsCollection.updateOne(
        { userId: host.userId },
        { 
          $set: { 
            hostPortfolioImages: hostImages,
            profileImage: hostImages[0] // Use first image as profile
          }
        }
      );
      
      console.log(`Updated host ${host.userId} with ${hostImages.length} images`);
    }
    
    console.log('Database update completed successfully!');
    
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await client.close();
  }
}

// Main execution function
async function main() {
  try {
    // Step 1: Copy images to public folder
    const copiedImages = copyImagesToPublic();
    
    // Step 2: Update database
    await updateDatabaseWithImages(copiedImages);
    
    console.log('\n=== Setup Complete! ===');
    console.log('Your property images have been set up successfully.');
    console.log('Restart your frontend development server to see the changes.');
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Run the setup
main();
