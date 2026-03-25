const { MongoClient } = require('mongodb');

// Same sets of names and images...
const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];

const guestImages = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200",
  "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=200"
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
  "Convenient, cozy, and overall exactly what we needed for this trip. Thank you!",
  "It was okay, but the wifi was a bit spotty at times. Comfortable bed though.",
  "Nice quaint place, definitely met our expectations for a short trip.",
  "Host was unresponsive initially but the place itself was great. Overall 4 stars.",
  "Location is a bit far from the main road, but perfectly tranquil.",
  "A bit noisy at night due to traffic, but inside it accommodated us well.",
  "Had a few issues with the hot water, but the host fixed it quickly. Nice stay.",
  "Not particularly impressive, but gets the job done if you just need a place to sleep.",
  "Way smaller than the pictures made it seem, but clean at least.",
  "Absolutely terrible experience. Found bugs in the bathroom and the AC didn't work.",
  "The check-in instructions were confusing. Place was decently clean.",
  "Loved the rustic vibe of the place. Gives a very homely feeling.",
  "The property is well maintained and the aesthetics are pleasing.",
  "Highly average. Not bad, but not excellent either. 3/5.",
  "The kitchen lacked basic utensils. Had to buy our own plates."
];

const getRandInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandFloat = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
const getRandDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffleArray = (array) => {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

async function fixDatabases() {
  const uriOptions = 'retryWrites=true&w=majority&appName=cluster0';
  const baseUri = 'mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/';
  
  const clientUser = new MongoClient(baseUri + 'userdb?' + uriOptions);
  const clientReview = new MongoClient(baseUri + 'reviewdb?' + uriOptions);

  try {
    await clientUser.connect();
    await clientReview.connect();
    const userDb = clientUser.db('userdb');
    const reviewDb = clientReview.db('reviewdb');

    console.log('Connected to both userdb and reviewdb in MongoDB Atlas');

    // 1. Delete mistakenly created generated users in userdb.users
    const delUsersRes = await userDb.collection('users').deleteMany({ email: { $regex: 'generated_guest' } });
    console.log(`Removed ${delUsersRes.deletedCount} mistaken guest docs from users collection`);

    // 2. Clear old incorrectly placed reviews in userdb.reviews
    await userDb.collection('reviews').drop().catch(()=>console.log("No reviews collection in userdb to drop."));

    // 3. Clear ALL generated guests from guests collection so we can repopulate fresh 100
    const delGuestsRes = await userDb.collection('guests').deleteMany({ email: { $regex: 'generated_guest' } });
    console.log(`Cleaned up ${delGuestsRes.deletedCount} old guests from guests collection`);

    // 4. Clear old generated reviews from reviewdb
    const delReviewsRes = await reviewDb.collection('reviews').deleteMany({ guestName: { $ne: "Ahnaf Akib Tanim" } });
    console.log(`Deleted ${delReviewsRes.deletedCount} old generated reviews from reviewdb.`);

    // 5. Generate 100 unique guests exactly
    const guests = [];
    const usedNames = new Set();
    while (guests.length < 100) {
      const fName = getRandomElement(firstNames);
      const lName = getRandomElement(lastNames);
      const name = `${fName} ${lName}`;
      if (!usedNames.has(name)) {
        usedNames.add(name);
        guests.push({
          guestId: generateUUID(),
          guestName: name,
          guestProfileImage: getRandomElement(guestImages),
        });
      }
    }

    // Insert these 100 guests into 'guests' collection
    const guestDocs = guests.map((g, idx) => ({
      "_class": "com.airbnb.user.model.Guest",
      "userId": g.guestId,
      "email": `generated_guest_${idx}@example.com`,
      "password": "$2b$12$qfvtKxBnraUKMWRTajeKtuqh861kyso7Wb6AtYPairQltIsYIKWuW", 
      "firstName": g.guestName.split(' ')[0],
      "lastName": g.guestName.split(' ')[1],
      "profileImage": g.guestProfileImage,
      "role": "GUEST",
      "status": "ACTIVE",
      "createdAt": new Date(),
      "updatedAt": new Date()
    }));
    await userDb.collection('guests').insertMany(guestDocs);
    console.log("Inserted 100 unique guests correctly into 'guests' collection.");

    // 6. Process all hosts to add varied reviews per property into reviewdb
    const cursor = userDb.collection('hosts').find({});
    let processedCount = 0;
    const newReviews = [];
    const bulkHostsOps = [];

    while (await cursor.hasNext()) {
      const host = await cursor.next();
      const properties = host.hostedProperties || [];
      if (properties.length === 0) continue;

      const hostBiasRoll = Math.random();
      let hostBias;
      if (hostBiasRoll < 0.1) hostBias = 0; 
      else if (hostBiasRoll < 0.3) hostBias = 1; 
      else hostBias = 2; 

      let reviewCount = 0; 
      let reviewSum = 0;

      for (const property of properties) {
         const shuffledGuests = shuffleArray([...guests]);
         const shuffledTexts = shuffleArray([...reviewsTexts]);
         
         const numReviews = getRandInt(3, 5);
         
         for (let i = 0; i < numReviews; i++) {
           const guest = shuffledGuests[i];
           
           let minR, maxR;
           if (hostBias === 0) { minR = 1.0; maxR = 3.5; }
           else if (hostBias === 1) { minR = 2.5; maxR = 4.2; }
           else { minR = 4.0; maxR = 5.0; }

           const rating = getRandFloat(minR, maxR);
           const reviewText = shuffledTexts[i]; 

           newReviews.push({
             "_class": "com.airbnb.review.model.Review",
             "bookingId": generateUUID(),
             "guestId": guest.guestId,
             "hostId": host.userId,
             "propertyId": property.propertyId || "default",
             "overallRating": rating,
             "cleanlinessRating": Math.min(5, Math.max(1, rating + getRandFloat(-0.5, 0.5))),
             "accuracyRating": Math.min(5, Math.max(1, rating + getRandFloat(-0.5, 0.5))),
             "checkInRating": Math.min(5, Math.max(1, rating + getRandFloat(-0.5, 0.5))),
             "communicationRating": Math.min(5, Math.max(1, rating + getRandFloat(-0.5, 0.5))),
             "locationRating": Math.min(5, Math.max(1, rating + getRandFloat(-0.5, 0.5))),
             "valueRating": Math.min(5, Math.max(1, rating + getRandFloat(-0.5, 0.5))),
             "reviewText": reviewText,
             "guestName": guest.guestName,
             "guestProfileImage": guest.guestProfileImage,
             "status": "APPROVED",
             "isGuestFavorite": rating > 4.7 && Math.random() > 0.5,
             "helpfulCount": getRandInt(0, 10),
             "helpfulByUserIds": [],
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
                cleanlinessRating: Math.min(5, newAvgRating + 0.1),
                accuracyRating: Math.min(5, newAvgRating + 0.2),
                checkInRating: 4.8, 
                communicationRating: Math.min(5, newAvgRating + 0.1),
                locationRating: 4.5,
                valueRating: Math.min(5, newAvgRating - 0.1)
             }
          }
        }
      });
      processedCount++;

      if (bulkHostsOps.length >= 100) {
        await userDb.collection('hosts').bulkWrite(bulkHostsOps);
        bulkHostsOps.length = 0;
        console.log(`Updated stats for ${processedCount} hosts...`);
      }
    }

    if (bulkHostsOps.length > 0) {
      await userDb.collection('hosts').bulkWrite(bulkHostsOps);
      console.log(`Updated stats for all ${processedCount} hosts.`);
    }

    // IMPORTANT: INSert all generated reviews into reviewdb!
    console.log(`Generated ${newReviews.length} new reviews. Slicing and inserting into reviewdb...`);
    const chunkSize = 3000;
    for (let c = 0; c < newReviews.length; c += chunkSize) {
       const chunk = newReviews.slice(c, c + chunkSize);
       await reviewDb.collection('reviews').insertMany(chunk);
    }
    console.log(`Successfully completed insertion of ${newReviews.length} reviews physically into reviewdb!`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await clientUser.close();
    await clientReview.close();
  }
}

fixDatabases();
