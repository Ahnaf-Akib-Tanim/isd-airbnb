const { MongoClient } = require('mongodb');

// Import the hosts data
const hosts = require('./seed-hosts-multiple-properties.js');

async function seedHosts() {
  const client = new MongoClient('mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/userdb?retryWrites=true&w=majority&appName=cluster0');
  
  try {
    await client.connect();
    const db = client.db('userdb');
    
    console.log('Connected to MongoDB Atlas');
    
    // Clear existing hosts to avoid duplicates
    const deleteResult = await db.collection('hosts').deleteMany({});
    console.log('Cleared existing hosts:', deleteResult.deletedCount);
    
    // Insert new hosts
    const result = await db.collection('hosts').insertMany(hosts);
    console.log('Successfully inserted', result.insertedCount, 'hosts with multiple properties');
    
    // Verify insertion
    const count = await db.collection('hosts').countDocuments();
    console.log('Total hosts in collection:', count);
    
    // Show sample host with properties
    const sampleHost = await db.collection('hosts').findOne({});
    console.log('Sample host properties count:', sampleHost.hostedProperties ? sampleHost.hostedProperties.length : 0);
    console.log('Sample host name:', sampleHost.hostDisplayName);
    
  } catch (error) {
    console.error('Error seeding hosts:', error);
  } finally {
    await client.close();
  }
}

seedHosts();
