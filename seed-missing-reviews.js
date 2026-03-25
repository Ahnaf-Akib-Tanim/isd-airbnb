const { MongoClient } = require('mongodb');

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"];
const guestImages = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
];

const reviewsTexts = [
  "Absolutely wonderful stay! The place was immaculate and exactly as described.",
  "Great location, easy check-in. The host was very communicative and helpful.",
  "Loved the amenities. Would definitely come back here again.",
  "Highly recommend this listing. The host went above and beyond.",
  "Good value for the price. The neighborhood is very safe."
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
for(let i=0; i<30; i++) {
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

    // ONLY fetch hosts that have less than 3 reviews, or the main host
    const query = { $or: [ { reviewCount: { $lt: 3 } }, { reviewCount: { $exists: false } }, { email: "host1@gmail.com" }, { email: "host2@gmail.com" } ] };
    const hosts = await db.collection('hosts').find(query).limit(200).toArray();
    
    console.log(`Found ${hosts.length} hosts to update`);
    
    let totalReviewsInserted = 0;
    
    for (const host of hosts) {
       const properties = host.hostedProperties || [];
       if (properties.length === 0) continue; 

       let reviewCount = host.reviewCount || 0;
       
       // check if host already has enough reviews. If it does specifically check host1@gmail.com
       if (reviewCount >= 3 && !host.email.includes("host1")) {
           continue;
       }

       let reviewSum = (host.averageRating || 0) * reviewCount;
       const newReviews = [];

       for (const property of properties) {
          // ensure property has an image
          if (!property.images || property.images.length === 0) {
              property.images = ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"];
          }

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
              "cleanlinessRating": rating,
              "accuracyRating": rating,
              "checkInRating": rating,
              "communicationRating": rating,
              "locationRating": rating,
              "valueRating": rating,
              "reviewText": getRandom(reviewsTexts),
              "guestName": guest.guestName,
              "guestProfileImage": guest.guestProfileImage,
              "status": "APPROVED",
              "isGuestFavorite": Math.random() > 0.5,
              "helpfulCount": getRandInt(0, 10),
              "helpfulByUserIds": [],
              "mentionedCategories": ["Cleanliness"],
              "createdAt": getRandDate(new Date(2023, 0, 1), new Date()),
              "updatedAt": new Date()
            });
            reviewSum += rating;
            reviewCount++;
          }
       }
      
       const newAvgRating = reviewCount > 0 ? Number((reviewSum / reviewCount).toFixed(2)) : 0;
       
       await db.collection('hosts').updateOne(
          { _id: host._id },
          {
            $set: {
              reviewCount: reviewCount,
              averageRating: newAvgRating,
              hostedProperties: properties // to save any image fixes
            }
          }
       );
       
       if (newReviews.length > 0) {
          await db.collection('reviews').insertMany(newReviews);
          totalReviewsInserted += newReviews.length;
       }
    }

    console.log(`Done! Inserted ${totalReviewsInserted} reviews.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

seed();
