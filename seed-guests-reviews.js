const { MongoClient } = require('mongodb');

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

const guestImages = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
];

const reviewsTexts = [
  "Absolutely wonderful stay! The place was immaculate and exactly as described. Will re-book soon.",
  "Great location, easy check-in. The host was very communicative and helpful throughout.",
  "Loved the amenities. Would definitely come back here again. Perfect view to wake up to.",
  "Clean, quiet, and comfortable. Perfect for our weekend getaway. The neighborhood feels safe.",
  "The views were stunning and the bed was super comfortable. Kitchen was well-stocked.",
  "Highly recommend this listing. The host went above and beyond to make us feel welcome.",
  "Good value for the price. The place is decorated nicely and very close to local transit.",
  "A truly five-star experience from start to finish. Everything was spotless.",
  "Beautifully done interior, and the stay was very relaxing. 10/10.",
  "Convenient, cozy, and overall exactly what we needed for this trip. Thank you!"
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandFloat = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
const getRandDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const guests = [];
for(let i=0; i<200; i++) {
  guests.push({
    guestId: generateUUID(),
    guestName: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
    guestProfileImage: getRandom(guestImages)
  });
}

async function seed() {
  const uri = 'mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/userdb?retryWrites=true&w=majority&appName=cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('userdb');
    console.log('Connected to MongoDB Atlas');

    const hosts = await db.collection('hosts').find({}).toArray();
    console.log(`Found ${hosts.length} hosts. Processing...`);

    const newReviews = [];
    const bulkHostsOps = [];
    const batchSize = 100;

    // Use a smaller subset of hosts if there are too many, or do them all. There are ~1150. We can do all of them.
    for (let hIndex = 0; hIndex < hosts.length; hIndex++) {
      const host = hosts[hIndex];
      const properties = host.hostedProperties || [];
      
      if (properties.length === 0) continue; // skip if no properties

      let reviewCount = host.reviewCount || 0;
      let reviewSum = (host.averageRating || 0) * reviewCount;

      for (const property of properties) {
        // Add 3-5 reviews
        const numReviews = getRandInt(3, 5);
        for (let i = 0; i < numReviews; i++) {
          const rating = getRandFloat(4.0, 5.0);
          const guest = getRandom(guests);
          
          newReviews.push({
            "_class": "com.airbnb.review.model.Review",
            "bookingId": generateUUID(),
            "guestId": guest.guestId,
            "hostId": host.userId,
            "propertyId": property.propertyId || "default",
            "overallRating": rating,
            "cleanlinessRating": Math.min(5, rating + getRandFloat(-0.2, 0.5)),
            "accuracyRating": Math.min(5, rating + getRandFloat(-0.2, 0.5)),
            "checkInRating": Math.min(5, rating + getRandFloat(-0.2, 0.5)),
            "communicationRating": Math.min(5, rating + getRandFloat(-0.2, 0.5)),
            "locationRating": Math.min(5, rating + getRandFloat(-0.2, 0.5)),
            "valueRating": Math.min(5, rating + getRandFloat(-0.2, 0.5)),
            "reviewText": getRandom(reviewsTexts),
            "guestName": guest.guestName,
            "guestProfileImage": guest.guestProfileImage,
            "status": "APPROVED",
            "isGuestFavorite": Math.random() > 0.8,
            "helpfulCount": getRandInt(0, 10),
            "helpfulByUserIds": [],
            "mentionedCategories": ["Cleanliness", "Location", "Check-in"].sort(() => 0.5 - Math.random()).slice(0, 1),
            "createdAt": getRandDate(new Date(2023, 0, 1), new Date()),
            "updatedAt": new Date()
          });
          reviewSum += rating;
          reviewCount++;
        }
      }
      
      const newAvgRating = reviewCount > 0 ? Number((reviewSum / reviewCount).toFixed(2)) : 0;
      
      bulkHostsOps.push({
        updateOne: {
          filter: { _id: host._id },
          update: {
            $set: {
              reviewCount: reviewCount,
              averageRating: newAvgRating,
              cleanlinessRating: 4.8,
              accuracyRating: 4.7,
              checkInRating: 4.9,
              communicationRating: 4.8,
              locationRating: 4.6,
              valueRating: 4.7
            }
          }
        }
      });
      
      if (bulkHostsOps.length >= batchSize || hIndex === hosts.length - 1) {
        await db.collection('hosts').bulkWrite(bulkHostsOps);
        bulkHostsOps.length = 0;
        console.log(`Processed hosts batch up to ${hIndex + 1}`);
      }
    }

    if (newReviews.length > 0) {
      // also bulk write reviews in chunks to not exceed memory
      const chunkSize = 5000;
      for (let i=0; i < newReviews.length; i += chunkSize) {
          const chunk = newReviews.slice(i, i + chunkSize);
          await db.collection('reviews').insertMany(chunk);
          console.log(`Inserted chunk of ${chunk.length} reviews. Total inserted: ${Math.min(i + chunkSize, newReviews.length)} / ${newReviews.length}`);
      }
    } else {
      console.log('No new reviews generated.');
    }
    
    // Check if guests collection exists. The earlier check printed 'guests' as a collection. So we can also insert the 200 guests there just in case, representing guest accounts.
    const guestDocs = guests.map(g => ({
        "_class": "com.airbnb.user.model.User",
        "userId": g.guestId,
        "email": `${g.guestName.replace(' ', '.').toLowerCase()}@example.com`,
        "password": "$2b$12$qfvtKxBnraUKMWRTajeKtuqh861kyso7Wb6AtYPairQltIsYIKWuW", // dummy
        "firstName": g.guestName.split(' ')[0],
        "lastName": g.guestName.split(' ')[1],
        "profileImage": g.guestProfileImage,
        "role": "GUEST",
        "status": "ACTIVE",
        "createdAt": new Date(),
        "updatedAt": new Date()
    }));
    await db.collection('guests').insertMany(guestDocs);
    console.log("Also inserted 200 guests into 'guests' collection.");

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

seed();
