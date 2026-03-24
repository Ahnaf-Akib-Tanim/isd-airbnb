const { MongoClient } = require('mongodb');

// Unsplash image categories and seeds
const unsplashCategories = {
  bedroom: ['bedroom', 'cozy', 'hotel', 'motel', 'guest'],
  bathroom: ['bathroom', 'modern', 'clean', 'spa', 'luxury'],
  kitchen: ['kitchen', 'modern', 'cooking', 'dining', 'chef'],
  living_room: ['living', 'sofa', 'comfortable', 'modern', 'cozy'],
  exterior: ['building', 'hotel', 'resort', 'exterior', 'architecture'],
  dining_room: ['dining', 'restaurant', 'table', 'elegant', 'food'],
  view: ['view', 'landscape', 'city', 'ocean', 'mountain'],
  amenities: ['pool', 'gym', 'spa', 'luxury', 'comfort']
};

function getUnsplashUrl(category, index) {
  const seeds = unsplashCategories[category] || ['room', 'hotel', 'modern'];
  const seed = seeds[index % seeds.length];
  const width = 800;
  const height = 600;
  return `https://source.unsplash.com/featured/${width}x${height}?${seed},hotel,modern`;
}

async function updateToUnsplashImages() {
  const client = new MongoClient('mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/userdb?retryWrites=true&w=majority&appName=cluster0');
  
  try {
    await client.connect();
    const db = client.db('userdb');
    
    console.log('Connected to MongoDB Atlas');
    
    // Get all hosts
    const hosts = await db.collection('hosts').find({}).toArray();
    console.log(`Found ${hosts.length} hosts to update`);
    
    let updatedCount = 0;
    
    for (const host of hosts) {
      const updatedHost = { ...host };
      
      // Fix host portfolio images
      if (host.hostPortfolioImages && Array.isArray(host.hostPortfolioImages)) {
        updatedHost.hostPortfolioImages = host.hostPortfolioImages.map((img, index) => {
          // Use Unsplash URLs with different categories
          const categories = Object.keys(unsplashCategories);
          const category = categories[index % categories.length];
          return getUnsplashUrl(category, index);
        });
      }
      
      // Fix hosted property images
      if (host.hostedProperties && Array.isArray(host.hostedProperties)) {
        updatedHost.hostedProperties = host.hostedProperties.map((property, propIndex) => {
          const updatedProperty = { ...property };
          
          if (property.images && Array.isArray(property.images)) {
            updatedProperty.images = property.images.map((img, imgIndex) => {
              // Use different categories for variety
              const categories = Object.keys(unsplashCategories);
              const category = categories[(propIndex + imgIndex) % categories.length];
              return getUnsplashUrl(category, propIndex + imgIndex);
            });
          }
          
          return updatedProperty;
        });
      }
      
      // Update the host in the database
      await db.collection('hosts').updateOne(
        { _id: host._id },
        { $set: updatedHost }
      );
      
      updatedCount++;
      
      if (updatedCount % 100 === 0) {
        console.log(`Updated ${updatedCount} hosts...`);
      }
    }
    
    console.log(`Successfully updated images for ${updatedCount} hosts`);
    
    // Show a sample
    const sampleHost = await db.collection('hosts').findOne({});
    console.log('\nSample updated host image URLs:');
    console.log('Host portfolio images:', sampleHost.hostPortfolioImages?.slice(0, 2));
    if (sampleHost.hostedProperties && sampleHost.hostedProperties.length > 0) {
      console.log('Property images:', sampleHost.hostedProperties[0].images?.slice(0, 2));
    }
    
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

updateToUnsplashImages();
