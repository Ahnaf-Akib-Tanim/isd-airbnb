const { MongoClient, ObjectId } = require('mongodb');

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];

const guestImages = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
];

const hostPortfolioImagesOptions = [
  ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"],
  ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
  ["https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=80"]
];


const reviewsTexts = [
  "Absolutely wonderful stay! The place was immaculate and exactly as described.",
  "Great location, easy check-in. The host was very communicative.",
  "Loved the amenities. Would definitely come back here again.",
  "Clean, quiet, and comfortable. Perfect for our weekend getaway.",
  "The views were stunning and the bed was super comfortable.",
  "Highly recommend this listing. The host went above and beyond.",
  "Good value for the price. The neighborhood is very safe.",
  "A truly five-star experience from start to finish."
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

async function seed() {
  const uri = 'mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/userdb?retryWrites=true&w=majority&appName=cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('userdb');
    console.log('Connected to MongoDB Atlas');

    const hosts = await db.collection('hosts').find({}).toArray();
    console.log(`Found ${hosts.length} hosts`);

    const newReviews = [];
    
    for (const host of hosts) {
      let isHostUpdated = false;
      const properties = host.hostedProperties || [];
      
      // If host has no properties, give them one
      if (properties.length === 0) {
        const propId = `prop-${host.userId.substring(0,8)}-0`;
        properties.push({
          propertyId: propId,
          propertyName: host.hostDisplayName || `${host.firstName}'s Place`,
          propertyType: host.propertyTypesOffered?.[0] || 'Apartment',
          images: host.hostPortfolioImages?.length ? host.hostPortfolioImages : getRandom(hostPortfolioImagesOptions),
          nightlyRateUsd: host.nightlyRateUsd || 100,
          description: host.hostAbout || "A lovely place to stay",
          city: host.city || "Dhaka"
        });
        isHostUpdated = true;
      }
      
      // Ensure all properties have at least one image
      for(let p of properties) {
          if (!p.images || p.images.length === 0) {
              p.images = getRandom(hostPortfolioImagesOptions);
              isHostUpdated = true;
          }
      }

      host.hostedProperties = properties;
      
      // Calculate overall stats for host
      let hostReviewCount = host.reviewCount || 0;
      let reviewSum = (host.averageRating || 0) * hostReviewCount;

      for (const property of properties) {
        const numReviews = getRandInt(3, 5);
        for (let i = 0; i < numReviews; i++) {
          const rating = getRandFloat(4.0, 5.0);
          newReviews.push({
            "_class": "com.airbnb.review.model.Review",
            "bookingId": generateUUID(),
            "guestId": generateUUID(),
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
            "guestName": `${getRandom(firstNames)} ${getRandom(lastNames)}`,
            "guestProfileImage": getRandom(guestImages),
            "status": "APPROVED",
            "isGuestFavorite": Math.random() > 0.8,
            "helpfulCount": getRandInt(0, 10),
            "helpfulByUserIds": [],
            "createdAt": getRandDate(new Date(2023, 0, 1), new Date()),
            "updatedAt": new Date()
          });
          reviewSum += rating;
          hostReviewCount++;
          isHostUpdated = true;
        }
      }
      
      if (isHostUpdated) {
        host.reviewCount = hostReviewCount;
        host.averageRating = Number((reviewSum / hostReviewCount).toFixed(2));
        await db.collection('hosts').updateOne(
          { _id: host._id }, 
          { $set: { 
             hostedProperties: host.hostedProperties,
             reviewCount: host.reviewCount,
             averageRating: host.averageRating,
             hostPortfolioImages: properties[0]?.images || host.hostPortfolioImages
          }}
        );
      }
    }

    if (newReviews.length > 0) {
      const result = await db.collection('reviews').insertMany(newReviews);
      console.log(`Inserted ${result.insertedCount} new reviews.`);
    } else {
      console.log('No new reviews generated.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

seed();
