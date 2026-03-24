const fs = require('fs');
const path = require('path');

// Configuration
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

// Main function to copy images to public folder
function copyImagesToPublic() {
  console.log('Starting image copy process...');
  
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
    console.log('No images found in local folders.');
    return;
  }
  
  // Copy images to public folder with unique names
  let copiedCount = 0;
  for (let i = 0; i < allImages.length; i++) {
    const sourcePath = allImages[i];
    const ext = path.extname(sourcePath);
    const destPath = path.join(PUBLIC_IMAGES_PATH, `property-${i}${ext}`);
    
    try {
      fs.copyFileSync(sourcePath, destPath);
      copiedCount++;
      console.log(`Copied: ${sourcePath} -> ${destPath}`);
    } catch (error) {
      console.error(`Error copying ${sourcePath}:`, error.message);
    }
  }
  
  console.log(`Successfully copied ${copiedCount} images to ${PUBLIC_IMAGES_PATH}`);
  console.log('These images will be accessible at: /property-images/property-0.jpg, property-1.jpg, etc.');
}

// Run the script
copyImagesToPublic();
