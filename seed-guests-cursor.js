const { MongoClient } = require('mongodb');

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

const guestImages = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
];

const reviewsTexts = [
  "Absolutely wonderful stay! The place was immaculate and exactly as described. Will re-book soon.",
  "Great location, easy check-in. The host was very communicative and helpful throughout.",
  "Loved the amenities. Would definitely come back here again. Perfect view to wake up to.",
  "Clean, quiet, and comfortable. Perfect for our weekend getaway. The neighborhood feels safe.",
  "The views were stunning and the bed was super comfortable. Kitchen was well-stocked.",
  "Highly recommend this listing. The host went above and beyond to make us feel welcome."
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
for(let i=0; i<100; i++) {
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

    const cursor = db.collection('hosts').find({});
    
    let processedCount = 0;
    while(await cursor.hasNext()) {
       const host = await cursor.next();
       const properties = host.hostedProperties || [];
      
       if (properties.length === 0) continue; 

       // Skip some hosts if we want, to not do all 1150
       // But we specifically WANT the 3 original hosts to be reviewed.
       // Let's just process the ones that have reviewCount < 3 currently
       if (host.reviewCount > 100) continue; 

       let reviewCount = host.reviewCount || 0;
       let reviewSum = (host.averageRating || 0) * reviewCount;
       const newReviews = [];

       for (const property of properties) {
          const numReviews = getRandInt(3, 5);
          for (let i = 0; i < numReviews; i++) {
            const rating = getRandFloat(3.5, 5.0);
            const guest = getRandom(guests);
            
            newReviews.push({
              "_class": "com.airbnb.review.model.Review",
              "bookingId": generateUUID(),
              "guestId": guest.guestId,
              "hostId": host.userId,
              "propertyId": property.propertyId || "default",
              "overallRating": rating,
              "cleanlinessRating": Math.min(5, rating + getRandFloat(0, 0.5)),
              "accuracyRating": Math.min(5, rating + getRandFloat(0, 0.5)),
              "checkInRating": Math.min(5, rating + getRandFloat(0, 0.5)),
              "communicationRating": Math.min(5, rating + getRandFloat(0, 0.5)),
              "locationRating": Math.min(5, rating + getRandFloat(0, 0.5)),
              "valueRating": Math.min(5, rating + getRandFloat(0, 0.5)),
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
       
       await db.collection('hosts').updateOne(
          { _id: host._id },
          {
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
       );
       
       if (newReviews.length > 0) {
          await db.collection('reviews').insertMany(newReviews);
       }
       
       processedCount++;
       if (processedCount % 50 === 0) {
          console.log(`Processed ${processedCount} hosts...`);
       }
       if (processedCount >= 200) break; // only process 200 to be safe and fast
    }

    console.log(`Done processing ${processedCount} hosts.`);
    
    // Also insert guests into users collection if needed, so they are authentic.
    // The user's image had a review with avatar. Our inserted reviews DO have avatars.
    
    // Check if the original host has an empty images array in `hostedProperties`
    // Wait, Host1: userId: "de2c1f58-bf7a-430a-a606-5d0c926916a5".
    // Let's manually fix Host1 if properties lacked images.
    
    const host1 = await db.collection('hosts').findOne({ email: "host1@gmail.com" });
    if (host1) {
       for(let i=0; i<host1.hostedProperties.length; i++) {
           if (!host1.hostedProperties[i].images || host1.hostedProperties[i].images.length === 0) {
              host1.hostedProperties[i].images = [
                 "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                 "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
              ];
           }
       }
       await db.collection('hosts').updateOne({_id: host1._id}, {
           $set: { hostedProperties: host1.hostedProperties }
       });
       console.log("Fixed missing property images for Host1");
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

seed();
