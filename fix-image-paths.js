const { MongoClient } = require('mongodb');

async function fixImagePaths() {
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
        updatedHost.hostPortfolioImages = host.hostPortfolioImages.map(img => {
          // Convert local path to web-friendly URL
          if (img.includes('C:\\Buet\\CSE 326 ISD\\airbnb images\\')) {
            // Extract the relevant parts and create a web URL
            const parts = img.split('\\');
            const folder = parts[parts.length - 2]; // Get folder name (bedroom, bathroom, etc.)
            const filename = parts[parts.length - 1]; // Get filename
            
            // Create a placeholder URL (you'll need to set up image serving)
            return `/images/${folder}/${filename}`;
          }
          return img;
        });
      }
      
      // Fix hosted property images
      if (host.hostedProperties && Array.isArray(host.hostedProperties)) {
        updatedHost.hostedProperties = host.hostedProperties.map(property => {
          const updatedProperty = { ...property };
          
          if (property.images && Array.isArray(property.images)) {
            updatedProperty.images = property.images.map(img => {
              // Convert local path to web-friendly URL
              if (img.includes('C:\\Buet\\CSE 326 ISD\\airbnb images\\')) {
                const parts = img.split('\\');
                const folder = parts[parts.length - 2];
                const filename = parts[parts.length - 1];
                return `/images/${folder}/${filename}`;
              }
              return img;
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
    
    console.log(`Successfully updated image paths for ${updatedCount} hosts`);
    
    // Create a sample of the updated data
    const sampleHost = await db.collection('hosts').findOne({});
    console.log('\nSample updated host image paths:');
    console.log('Host portfolio images:', sampleHost.hostPortfolioImages?.slice(0, 2));
    if (sampleHost.hostedProperties && sampleHost.hostedProperties.length > 0) {
      console.log('Property images:', sampleHost.hostedProperties[0].images?.slice(0, 2));
    }
    
  } catch (error) {
    console.error('Error fixing image paths:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

fixImagePaths();
