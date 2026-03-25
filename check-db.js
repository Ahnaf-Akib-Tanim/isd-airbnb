const { MongoClient } = require('mongodb');

async function listCollections() {
  const uri = 'mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/userdb?retryWrites=true&w=majority&appName=cluster0';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('userdb');
    const cols = await db.listCollections().toArray();
    console.log("Collections:", cols.map(c => c.name));
    
    // Check hosts and users
    const usersCount = await db.collection('users').countDocuments();
    console.log("Users count:", usersCount);
    const usersHostsCount = await db.collection('users').countDocuments({role: "HOST"});
    console.log("Users with role HOST:", usersHostsCount);

    const hostsCount = await db.collection('hosts').countDocuments();
    console.log("Hosts count:", hostsCount);
    
    const hostsSample = await db.collection('hosts').findOne({});
    console.log("Sample Host ID:", hostsSample?.userId || hostsSample?._id);

    const usersHostSample = await db.collection('users').findOne({role: "HOST"});
    console.log("Sample Users Host ID:", usersHostSample?.userId || usersHostSample?._id);

  } catch(e) { console.error(e); }
  finally { await client.close(); }
}
listCollections();
