const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuration
const MONGODB_URI = 'mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/userdb?retryWrites=true&w=majority&appName=cluster0';
const IMAGE_BASE_PATH = 'C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data';

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

// Helper function to convert local path to web-accessible URL
function localPathToUrl(localPath, index) {
  // Use public folder URL that will be accessible in the browser
  return `/property-images/property-${index}.jpg`;
}

// Main function to update host images
async function updateHostImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('userdb');
    const hostsCollection = db.collection('hosts');
    
    console.log('Connected to MongoDB');
    
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
      console.log('No images found in local folders. Using fallback images...');
      
      // Fallback: Use some sample Unsplash images
      const fallbackImages = [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=85&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=85&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=85&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1449158793745-1bf2b9c7b5f4?q=85&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=85&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=85&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=85&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551887195-71f31ef1c9ab?q=85&w=800&auto=format&fit=crop'
      ];
      
      // Update all hosts with fallback images
      const hosts = await hostsCollection.find({}).toArray();
      console.log(`Updating ${hosts.length} hosts with fallback images...`);
      
      for (const host of hosts) {
        // Assign 3-5 random images per host
        const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images
        const hostImages = [];
        
        for (let i = 0; i < numImages; i++) {
          const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
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
      
    } else {
      // Use local images
      const hosts = await hostsCollection.find({}).toArray();
      console.log(`Updating ${hosts.length} hosts with local images...`);
      
      for (const host of hosts) {
        // Assign 3-5 random images per host
        const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images
        const hostImages = [];
        
        for (let i = 0; i < numImages; i++) {
          const randomIndex = Math.floor(Math.random() * allImages.length);
          hostImages.push(localPathToUrl(allImages[randomIndex], randomIndex));
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
    }
    
    console.log('Image update completed successfully!');
    
  } catch (error) {
    console.error('Error updating host images:', error);
  } finally {
    await client.close();
  }
}

// Run the script
updateHostImages();
