const { MongoClient } = require('mongodb');

// Proper Unsplash URL format
function getProperUnsplashUrl(seed, width = 400, height = 300) {
  return `https://source.unsplash.com/random/${width}x${height}?${seed}&hotel,modern,interior`;
}

async function fixUnsplashUrls() {
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
          // Generate proper Unsplash URLs with different seeds
          const seeds = ['luxury-hotel', 'modern-room', 'cozy-bedroom', 'elegant-suite', 'stylish-apartment'];
          const seed = seeds[index % seeds.length];
          return getProperUnsplashUrl(seed, 400, 300);
        });
      }
      
      // Fix hosted property images
      if (host.hostedProperties && Array.isArray(host.hostedProperties)) {
        updatedHost.hostedProperties = host.hostedProperties.map((property, propIndex) => {
          const updatedProperty = { ...property };
          
          if (property.images && Array.isArray(property.images)) {
            updatedProperty.images = property.images.map((img, imgIndex) => {
              // Use different seeds for variety
              const seeds = ['hotel-room', 'luxury-suite', 'modern-interior', 'cozy-space', 'stylish-accommodation'];
              const seed = seeds[(propIndex + imgIndex) % seeds.length];
              return getProperUnsplashUrl(seed, 400, 300);
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
    
    console.log(`Successfully updated image URLs for ${updatedCount} hosts`);
    
    // Show a sample
    const sampleHost = await db.collection('hosts').findOne({});
    console.log('\nSample updated host image URLs:');
    console.log('Host portfolio images:', sampleHost.hostPortfolioImages?.slice(0, 2));
    if (sampleHost.hostedProperties && sampleHost.hostedProperties.length > 0) {
      console.log('Property images:', sampleHost.hostedProperties[0].images?.slice(0, 2));
    }
    
  } catch (error) {
    console.error('Error fixing image URLs:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

fixUnsplashUrls();
