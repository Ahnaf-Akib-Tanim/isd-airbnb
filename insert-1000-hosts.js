const { MongoClient } = require('mongodb');

// Import the generated hosts data
const hosts = require('./1000-hosts.json');

async function insert1000Hosts() {
  const client = new MongoClient('mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/userdb?retryWrites=true&w=majority&appName=cluster0');
  
  try {
    await client.connect();
    const db = client.db('userdb');
    
    console.log('Connected to MongoDB Atlas');
    
    // Clear existing hosts to avoid duplicates
    const deleteResult = await db.collection('hosts').deleteMany({});
    console.log('Cleared existing hosts:', deleteResult.deletedCount);
    
    // Insert new hosts in batches for better performance
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < hosts.length; i += batchSize) {
      const batch = hosts.slice(i, i + batchSize);
      const result = await db.collection('hosts').insertMany(batch);
      totalInserted += result.insertedCount;
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}: ${result.insertedCount} hosts`);
    }
    
    console.log('Successfully inserted', totalInserted, 'hosts with multiple properties');
    
    // Get some statistics
    const totalHosts = await db.collection('hosts').countDocuments();
    const totalProperties = await db.collection('hosts').aggregate([
      { $project: { propertyCount: { $size: "$hostedProperties" } } },
      { $group: { _id: null, totalProperties: { $sum: "$propertyCount" } } }
    ]).toArray();
    
    const countryStats = await db.collection('hosts').aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n=== STATISTICS ===');
    console.log('Total hosts:', totalHosts);
    console.log('Total properties:', totalProperties[0]?.totalProperties || 0);
    console.log('Average properties per host:', (totalProperties[0]?.totalProperties / totalHosts).toFixed(2));
    
    console.log('\n=== HOSTS BY COUNTRY ===');
    countryStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} hosts`);
    });
    
  } catch (error) {
    console.error('Error inserting hosts:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

insert1000Hosts();
