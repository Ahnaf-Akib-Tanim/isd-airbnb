const { MongoClient } = require('mongodb');

// Helpers for random data
const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const cities = ["New York", "London", "Tokyo", "Paris", "Sydney", "Rome", "Berlin", "Toronto", "Dubai", "Singapore"];
const propsArgs = ["Villa", "Apartment", "House", "Bungalow", "Cabin", "Loft"];

const guestImages = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
];

const hostPortfolioImagesOptions = [
  ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"],
  ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"],
  ["https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"]
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

const numHosts = 150;
const hosts = [];
const reviews = [];

for (let i = 0; i < numHosts; i++) {
  const hostId = generateUUID();
  const firstName = getRandom(firstNames);
  const lastName = getRandom(lastNames);
  const city = getRandom(cities);
  const propertyType = getRandom(propsArgs);
  const hostPic = getRandom(guestImages);

  const numProperties = getRandInt(1, 2);
  const hostedProperties = [];

  for(let j=0; j<numProperties; j++) {
    const propId = `prop-${hostId.substring(0,8)}-${j}`;
    hostedProperties.push({
      propertyId: propId,
      propertyName: `${firstName}'s ${propertyType} in ${city}`,
      propertyType: propertyType,
      description: `Beautiful ${propertyType} located exactly where you want to be in ${city}.`,
      street: "Main St",
      area: city,
      district: city,
      city: city,
      country: "Country",
      guestCapacity: getRandInt(2, 6),
      bedCount: getRandInt(1, 3),
      bedTypes: ["QUEEN_BED"],
      nightlyRateUsd: getRandInt(50, 300),
      amenities: ["Wifi", "AC", "Kitchen"],
      images: getRandom(hostPortfolioImagesOptions),
      payLaterAllowed: Math.random() > 0.5,
      cancellationPolicy: "MODERATE"
    });
  }

  const reviewCount = getRandInt(3, 10) * numProperties;
  const avgRating = getRandFloat(4.2, 5.0);

  hosts.push({
    "_class": "com.airbnb.user.model.User",
    "userId": hostId,
    "email": `host${Date.now()}_${hostId.substring(0,5)}@example.com`,
    "password": "$2b$12$qfvtKxBnraUKMWRTajeKtuqh861kyso7Wb6AtYPairQltIsYIKWuW", 
    "firstName": firstName,
    "lastName": lastName,
    "phoneNumber": `01${getRandInt(100000000, 999999999)}`,
    "profileImage": hostPic,
    "bio": `Hi, I'm ${firstName}! I love hosting travelers in ${city}.`,
    "role": "HOST",
    "status": "ACTIVE",
    "emailVerified": true,
    "verificationStatus": "APPROVED",
    "verificationRequestedAt": new Date(),
    "verifiedAt": new Date(),
    "city": city,
    "country": "Mock Country",
    "latitude": getRandFloat(-90, 90),
    "longitude": getRandFloat(-180, 180),
    "superhost": Math.random() > 0.7,
    "hostDisplayName": `${firstName}'s Place`,
    "hostAbout": "Enjoy your stay!",
    "hostingSince": new Date(2020, 1, 1),
    "preferredCheckInTime": "14:00",
    "preferredCheckOutTime": "11:00",
    "responseTimeHours": getRandInt(1, 24),
    "houseRules": "No smoking.",
    "propertyTypesOffered": [propertyType],
    "offeringHighlights": ["Great location", "Super clean"],
    "hostPortfolioImages": getRandom(hostPortfolioImagesOptions),
    "guestCapacity": getRandInt(2, 6),
    "bedCount": getRandInt(1, 3),
    "bedTypes": ["QUEEN_BED"],
    "nightlyRateUsd": getRandInt(50, 300),
    "payLaterAllowed": true,
    "payoutPercentage": 80.0,
    "cancellationPolicy": "MODERATE",
    "totalListings": numProperties,
    "averageRating": avgRating,
    "reviewCount": reviewCount,
    "responseRate": 95.0,
    "cleanlinessRating": getRandFloat(4.5, 5.0),
    "accuracyRating": getRandFloat(4.5, 5.0),
    "checkInRating": getRandFloat(4.5, 5.0),
    "communicationRating": getRandFloat(4.5, 5.0),
    "locationRating": getRandFloat(4.5, 5.0),
    "valueRating": getRandFloat(4.5, 5.0),
    "hostedProperties": hostedProperties,
    "createdAt": new Date(),
    "updatedAt": new Date()
  });

  for (let k = 0; k < hostedProperties.length; k++) {
      const propId = hostedProperties[k].propertyId;
      const totalReviewsForProp = getRandInt(3, 5);
      for(let r=0; r<totalReviewsForProp; r++) {
         reviews.push({
           "_class": "com.airbnb.review.model.Review",
           "bookingId": generateUUID(),
           "guestId": generateUUID(),
           "hostId": hostId,
           "propertyId": propId,
           "overallRating": getRandFloat(3.0, 5.0),
           "cleanlinessRating": getRandFloat(3.0, 5.0),
           "accuracyRating": getRandFloat(3.0, 5.0),
           "checkInRating": getRandFloat(3.0, 5.0),
           "communicationRating": getRandFloat(3.0, 5.0),
           "locationRating": getRandFloat(3.0, 5.0),
           "valueRating": getRandFloat(3.0, 5.0),
           "reviewText": getRandom(reviewsTexts),
           "guestName": `${getRandom(firstNames)} ${getRandom(lastNames)}`,
           "guestProfileImage": getRandom(guestImages),
           "status": "APPROVED",
           "isGuestFavorite": Math.random() > 0.8,
           "helpfulCount": getRandInt(0, 10),
           "helpfulByUserIds": [],
           "mentionedCategories": ["Cleanliness", "Location"].sort(() => 0.5 - Math.random()).slice(0, 1),
           "createdAt": getRandDate(new Date(2023, 0, 1), new Date()),
           "updatedAt": new Date()
         });
      }
  }
}

async function seed() {
  const uri = 'mongodb+srv://tanim:admin@cluster0.84zkttd.mongodb.net/userdb?retryWrites=true&w=majority&appName=cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('userdb');
    console.log('Connected to MongoDB Atlas');

    const hostsRes = await db.collection('hosts').insertMany(hosts);
    console.log('Inserted hosts:', hostsRes.insertedCount);

    const reviewsRes = await db.collection('reviews').insertMany(reviews);
    console.log('Inserted reviews:', reviewsRes.insertedCount);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

seed();
