const fs = require('fs');
const path = require('path');

// Hotel names
const hotelNames = [
  "Azure Haven Suites", "Velora Stay", "Urban Nest Hotel", "NovaSky Residences", "Luxe Horizon Inn",
  "Serenity Cove Retreat", "The Driftwood Hotel", "Opal Grand Stay", "Elysian Edge Hotel", "VistaBloom Suites",
  "The Zenith House", "Orchid Luxe Inn", "Solstice Stay", "Harborlight Hotel", "The Velvet Palm",
  "Skyline Aura Hotel", "Bluewave Residences", "The Ember Lodge", "Aurora Bay Suites", "Crystal Peak Hotel",
  "The Willow Crest", "Sunspire Inn", "Oceanic Pearl Hotel", "The Maple Haven", "Golden Arc Residences",
  "Tranquil Tide Inn", "The Ivory Loft", "CloudNine Hotel", "Saffron Sands Retreat", "The Meridian Stay"
];

// Locations data
const locations = {
  "Bangladesh": ["Dhaka", "Chittagong", "Cox's Bazar", "Sylhet", "Khulna", "Rajshahi", "Barisal", "Rangamati", "Bandarban", "Kuakata", "Gazipur", "Narayanganj", "Comilla", "Srimangal", "Pabna"],
  "India": ["Delhi", "Mumbai", "Bangalore", "Kolkata", "Chennai", "Hyderabad", "Goa", "Jaipur", "Udaipur", "Manali", "Shimla", "Varanasi", "Agra", "Kochi", "Pune"],
  "Pakistan": ["Islamabad", "Karachi", "Lahore", "Murree", "Hunza", "Skardu", "Peshawar", "Quetta", "Faisalabad", "Multan", "Swat", "Gwadar", "Abbottabad", "Sialkot", "Bahawalpur"],
  "Thailand": ["Bangkok", "Phuket", "Krabi", "Pattaya", "Chiang Mai", "Chiang Rai", "Ayutthaya", "Hua Hin", "Koh Samui", "Koh Phi Phi", "Koh Tao", "Surat Thani", "Pai", "Kanchanaburi", "Trang"],
  "Indonesia": ["Jakarta", "Bali", "Ubud", "Surabaya", "Bandung", "Yogyakarta", "Lombok", "Medan", "Semarang", "Makassar", "Bogor", "Batam", "Malang", "Denpasar", "Padang"],
  "USA": ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "San Francisco", "Seattle", "Boston", "Houston", "Orlando", "San Diego", "Dallas", "Denver", "Atlanta", "Washington DC"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Hiroshima", "Sapporo", "Nara", "Kobe", "Nagoya", "Fukuoka", "Hakone", "Kamakura", "Sendai", "Okinawa", "Kanazawa"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Antalya", "Cappadocia", "Bursa", "Bodrum", "Fethiye", "Alanya", "Trabzon", "Konya", "Marmaris", "Eskisehir", "Gaziantep", "Adana"],
  "UK": ["London", "Manchester", "Birmingham", "Liverpool", "Edinburgh", "Glasgow", "Bristol", "Leeds", "Oxford", "Cambridge", "York", "Nottingham", "Sheffield", "Cardiff", "Belfast"],
  "China": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Xi'an", "Nanjing", "Chongqing", "Wuhan", "Suzhou", "Qingdao", "Tianjin", "Harbin", "Kunming"],
  "Vietnam": ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hoi An", "Hue", "Nha Trang", "Phu Quoc", "Sapa", "Halong Bay", "Can Tho", "Dalat", "Vung Tau", "Hai Phong", "Quy Nhon", "Dong Hoi"],
  "Russia": ["Moscow", "Saint Petersburg", "Sochi", "Kazan", "Novosibirsk", "Yekaterinburg", "Vladivostok", "Irkutsk", "Kaliningrad", "Samara", "Omsk", "Ufa", "Perm", "Rostov-on-Don", "Volgograd"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Jeju", "Suwon", "Ulsan", "Gangneung", "Pohang", "Gyeongju", "Changwon", "Jeonju", "Cheonan"],
  "Italy": ["Rome", "Milan", "Venice", "Florence", "Naples", "Turin", "Bologna", "Verona", "Pisa", "Siena", "Palermo", "Genoa", "Como", "Amalfi", "Catania"],
  "France": ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux", "Toulouse", "Strasbourg", "Cannes", "Lille", "Nantes", "Montpellier", "Dijon", "Grenoble", "Avignon", "Rouen"],
  "Maldives": ["Male", "Maafushi", "Hulhumale", "Addu City", "Fuvahmulah", "Dhigurah", "Thulusdhoo", "Ukulhas", "Huraa", "Baa Atoll", "Ari Atoll", "Vaavu Atoll", "Rasdhoo", "Gulhi", "Fulidhoo"],
  "Sri Lanka": ["Colombo", "Kandy", "Galle", "Ella", "Nuwara Eliya", "Sigiriya", "Mirissa", "Negombo", "Trincomalee", "Anuradhapura", "Bentota", "Hikkaduwa", "Dambulla", "Jaffna", "Kalutara"],
  "Philippines": ["Manila", "Cebu", "Boracay", "Palawan", "Davao", "Baguio", "Iloilo", "Siargao", "Tagaytay", "Zamboanga", "Bohol", "Tacloban", "Dumaguete", "Puerto Princesa", "Cagayan de Oro"],
  "Malaysia": ["Kuala Lumpur", "Penang", "Langkawi", "Johor Bahru", "Malacca", "Ipoh", "Kota Kinabalu", "Kuching", "Shah Alam", "Putrajaya", "Subang Jaya", "Miri", "Sandakan", "Alor Setar", "Seremban"]
};

// Property types
const propertyTypes = ["Apartment", "House", "Villa", "Condo", "Studio", "Loft", "Penthouse", "Cottage", "Bungalow", "Townhouse"];

// Amenities
const amenities = [
  "WiFi", "Kitchen", "Air Conditioning", "Heating", "Washer", "Dryer", "Parking", "Pool",
  "Gym", "Elevator", "Balcony", "Terrace", "Garden", "Beach Access", "Mountain View",
  "City View", "Ocean View", "Workspace", "Smart TV", "Netflix", "Coffee Maker", "Refrigerator",
  "Dishwasher", "Microwave", "Oven", "Stove", "Toaster", "Blender", "Iron", "Hair Dryer",
  "Towels", "Bed Linens", "Essentials", "Shampoo", "Conditioner", "Body Soap", "Hot Water",
  "Shower", "Bathtub", "Fire Extinguisher", "Smoke Alarm", "First Aid Kit", "Lockbox",
  "24/7 Security", "Concierge", "Room Service", "Housekeeping", "Laundry Service", "Airport Shuttle"
];

// House rules
const houseRules = [
  "No smoking. Quiet hours 10pm-8am.",
  "No parties. Respect neighbors.",
  "No pets allowed. Additional fees for guests.",
  "Check-in after 3pm, check-out before 11am.",
  "No unauthorized guests. ID required.",
  "Quiet hours 9pm-7am. No loud music.",
  "No smoking indoors. Balcony allowed.",
  "No food or drinks in bedrooms.",
  "Shoes off at the entrance please.",
  "No unregistered visitors overnight.",
  "Respect house rules and neighbors.",
  "No illegal activities on premises.",
  "Keep common areas clean and tidy.",
  "No damage to property or furniture.",
  "Follow recycling and waste guidelines."
];

// Bio templates
const bioTemplates = [
  "Experienced host offering comfortable stays in {city}. Enjoy modern amenities and local hospitality.",
  "Passionate about providing exceptional guest experiences. Your home away from home in {city}.",
  "Local expert ready to help you discover the best of {city}. Clean, safe, and welcoming accommodation.",
  "Professional host dedicated to making your stay memorable. Located in the heart of {city}.",
  "Friendly host with extensive knowledge of {city}. Offering personalized recommendations and support.",
  "Committed to providing five-star service. Your comfort and satisfaction are my top priorities.",
  "Experienced superhost with hundreds of happy guests. Let me make your {city} trip unforgettable.",
  "Attention to detail and guest satisfaction guaranteed. Modern amenities in prime {city} location.",
  "Your local connection to the best experiences in {city}. Authentic hospitality and modern comfort.",
  "Dedicated host ensuring a seamless stay. From check-in to check-out, I'm here to help."
];

// About templates
const aboutTemplates = [
  "Experience the perfect blend of comfort and style in our carefully curated space. Located in the vibrant {city}, our property offers easy access to local attractions, dining, and entertainment. Whether you're here for business or leisure, you'll find everything you need for a memorable stay.",
  "Discover your home away from home in the heart of {city}. Our property combines modern amenities with warm hospitality to create the perfect retreat for travelers. Relax in comfortable surroundings and explore the best that {city} has to offer.",
  "Welcome to your urban oasis in {city}. This thoughtfully designed space provides the ideal base for exploring the city's attractions. With attention to detail and guest comfort as our priority, we ensure a pleasant and hassle-free stay.",
  "Escape to our tranquil haven in {city}. This property offers the perfect balance of convenience and serenity, allowing you to enjoy both the vibrant city life and peaceful relaxation. Modern amenities and thoughtful touches await you.",
  "Immerse yourself in the local culture of {city} from our comfortable and well-appointed accommodation. We've created a space that reflects the spirit of the city while providing all the comforts you expect from a premium stay."
];

// Utility functions
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateUserId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getRandomImages(count = 3) {
  const imagePaths = [
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Test Data\\bedroom",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Test Data\\bathroom",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Test Data\\kitchen",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Test Data\\living_room",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Test Data\\exterior",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Test Data\\dining_room",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Test Data\\view",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Test Data\\amenities",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Training Data\\bedroom",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Training Data\\bathroom",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Training Data\\kitchen",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Training Data\\living_room",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Training Data\\exterior",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Training Data\\dining_room",
    "C:\\Buet\\CSE 326 ISD\\airbnb images\\Airbnb Data\\Training Data\\view"
  ];
  
  const selectedImages = [];
  for (let i = 0; i < count; i++) {
    const folder = randomChoice(imagePaths);
    const imageNum = randomInt(1, 50); // Assume 50 images per folder
    const imageName = `image_${imageNum}.jpg`;
    selectedImages.push(`${folder}\\${imageName}`);
  }
  return selectedImages;
}

function generateHostedProperties(hotelName, city, country, hostId) {
  const propertyCount = randomInt(1, 3);
  const properties = [];
  
  for (let i = 0; i < propertyCount; i++) {
    const propertyType = randomChoice(propertyTypes);
    const propertyName = `${hotelName} - ${propertyType} ${i + 1}`;
    
    properties.push({
      propertyName: propertyName,
      propertyType: propertyType,
      description: randomChoice(aboutTemplates).replace('{city}', city),
      guestCapacity: randomInt(2, 8),
      bedCount: randomInt(1, 4),
      bedroomCount: randomInt(1, 3),
      bathroomCount: randomInt(1, 2),
      amenities: amenities.slice(0, randomInt(8, 20)),
      images: getRandomImages(randomInt(3, 5)),
      nightlyRateUsd: randomInt(50, 300),
      payLaterAllowed: Math.random() > 0.3,
      cancellationPolicy: randomChoice(["FLEXIBLE", "MODERATE", "STRICT"]),
      bookingCapacity: randomInt(1, 5),
      maxGuests: randomInt(2, 10),
      minimumStay: randomInt(1, 3),
      maximumStay: randomInt(7, 30),
      sizeSqMeters: randomInt(25, 150),
      floorNumber: randomInt(1, 20),
      hasElevator: Math.random() > 0.4,
      hasParking: Math.random() > 0.3,
      hasPool: Math.random() > 0.6,
      hasGym: Math.random() > 0.7,
      hasWiFi: true,
      hasAirConditioning: Math.random() > 0.2,
      hasHeating: Math.random() > 0.3,
      hasKitchen: Math.random() > 0.4,
      hasWasher: Math.random() > 0.5,
      hasDryer: Math.random() > 0.6,
      hasTV: true,
      hasWorkspace: Math.random() > 0.4,
      smokingAllowed: false,
      petsAllowed: Math.random() > 0.7,
      partiesAllowed: false,
      childrenAllowed: true,
      checkInTime: randomChoice(["14:00", "15:00", "16:00"]),
      checkOutTime: randomChoice(["10:00", "11:00", "12:00"]),
      securityDeposit: randomInt(100, 500),
      cleaningFee: randomInt(20, 100),
      serviceFee: randomInt(10, 50),
      taxesAndFees: randomInt(5, 25),
      weeklyDiscount: randomInt(5, 20),
      monthlyDiscount: randomInt(10, 30),
      instantBook: Math.random() > 0.5,
      superhost: Math.random() > 0.8
    });
  }
  
  return properties;
}

function generateHost(index, hotelName, country, city) {
  const firstName = `Host${index}`;
  const lastName = randomChoice(["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]);
  const email = `host${index}@gmail.com`;
  const userId = generateUserId();
  const phoneNumber = `+${randomInt(10000000000, 99999999999)}`;
  
  const hostedProperties = generateHostedProperties(hotelName, city, country, userId);
  
  return {
    _id: generateId(),
    _class: "com.airbnb.user.model.User",
    userId: userId,
    email: email,
    password: "$2b$12$qfvtKxBnraUKMWRTajeKtuqh861kyso7Wb6AtYPairQltIsYIKWuW", // Hashed password
    firstName: firstName,
    lastName: lastName,
    phoneNumber: phoneNumber,
    profileImage: `https://images.unsplash.com/photo-${randomInt(1500000000, 1600000000)}?q=80&w=80&auto=format&fit=crop`,
    bio: randomChoice(bioTemplates).replace('{city}', city),
    role: "HOST",
    status: "ACTIVE",
    emailVerified: true,
    verificationStatus: "APPROVED",
    verificationRequestedAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    street: `${hotelName} Street`,
    area: city,
    village: `${city} Central`,
    district: city,
    division: randomChoice(["North", "South", "East", "West", "Central"]),
    city: city,
    country: country,
    zipCode: randomInt(10000, 99999).toString(),
    latitude: randomFloat(-90, 90),
    longitude: randomFloat(-180, 180),
    superhost: Math.random() > 0.8,
    hostDisplayName: `${hotelName} by ${firstName}`,
    hostAbout: randomChoice(aboutTemplates).replace('{city}', city),
    hostingSince: new Date().toISOString(),
    preferredCheckInTime: randomChoice(["14:00", "15:00", "16:00"]),
    preferredCheckOutTime: randomChoice(["10:00", "11:00", "12:00"]),
    responseTimeHours: randomInt(1, 24),
    houseRules: randomChoice(houseRules),
    propertyTypesOffered: hostedProperties.map(p => p.propertyType).slice(0, 2),
    offeringHighlights: [
      "Premium location in the heart of the city",
      "Modern amenities and comfortable furnishings",
      "Exceptional guest service and support"
    ],
    hostPortfolioImages: getRandomImages(randomInt(2, 4)),
    guestCapacity: Math.max(...hostedProperties.map(p => p.guestCapacity)),
    bedCount: Math.max(...hostedProperties.map(p => p.bedCount)),
    bedTypes: hostedProperties.map(p => ({
      type: randomChoice(["King", "Queen", "Double", "Twin", "Sofa Bed"]),
      count: randomInt(1, 3)
    })).slice(0, 2),
    nightlyRateUsd: Math.min(...hostedProperties.map(p => p.nightlyRateUsd)),
    payLaterAllowed: hostedProperties.some(p => p.payLaterAllowed),
    payoutPercentage: randomInt(70, 90),
    cancellationPolicy: randomChoice(["FLEXIBLE", "MODERATE", "STRICT"]),
    totalListings: hostedProperties.length,
    averageRating: randomFloat(3.5, 5.0),
    reviewCount: randomInt(0, 500),
    responseRate: randomInt(85, 100),
    hostedProperties: hostedProperties,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Generate 1000 hosts
const hosts = [];
const countryNames = Object.keys(locations);
let hostIndex = 1;

for (let i = 0; i < 1000; i++) {
  const country = randomChoice(countryNames);
  const city = randomChoice(locations[country]);
  const hotelName = randomChoice(hotelNames);
  
  const host = generateHost(hostIndex, hotelName, country, city);
  hosts.push(host);
  hostIndex++;
}

// Write to file
fs.writeFileSync('1000-hosts.json', JSON.stringify(hosts, null, 2));
console.log('Generated 1000 hosts and saved to 1000-hosts.json');

// Extract 5 hosts for text file
const sampleHosts = hosts.slice(0, 5);
let sampleText = "SAMPLE 5 HOSTS DETAILS\n";
sampleText += "========================\n\n";

sampleHosts.forEach((host, index) => {
  sampleText += `HOST ${index + 1} DETAILS:\n`;
  sampleText += `================\n`;
  sampleText += `_id: ${host._id}\n`;
  sampleText += `_class: "${host._class}"\n`;
  sampleText += `userId: "${host.userId}"\n`;
  sampleText += `email: "${host.email}"\n`;
  sampleText += `password: "${host.password}"\n`;
  sampleText += `firstName: "${host.firstName}"\n`;
  sampleText += `lastName: "${host.lastName}"\n`;
  sampleText += `phoneNumber: "${host.phoneNumber}"\n`;
  sampleText += `profileImage: "${host.profileImage}"\n`;
  sampleText += `bio: "${host.bio}"\n`;
  sampleText += `role: "${host.role}"\n`;
  sampleText += `status: "${host.status}"\n`;
  sampleText += `emailVerified: ${host.emailVerified}\n`;
  sampleText += `verificationStatus: "${host.verificationStatus}"\n`;
  sampleText += `verificationRequestedAt: ${host.verificationRequestedAt}\n`;
  sampleText += `verifiedAt: ${host.verifiedAt}\n`;
  sampleText += `street: "${host.street}"\n`;
  sampleText += `area: "${host.area}"\n`;
  sampleText += `village: "${host.village}"\n`;
  sampleText += `district: "${host.district}"\n`;
  sampleText += `division: "${host.division}"\n`;
  sampleText += `city: "${host.city}"\n`;
  sampleText += `country: "${host.country}"\n`;
  sampleText += `zipCode: "${host.zipCode}"\n`;
  sampleText += `latitude: ${host.latitude}\n`;
  sampleText += `longitude: ${host.longitude}\n`;
  sampleText += `superhost: ${host.superhost}\n`;
  sampleText += `hostDisplayName: "${host.hostDisplayName}"\n`;
  sampleText += `hostAbout: "${host.hostAbout}"\n`;
  sampleText += `hostingSince: ${host.hostingSince}\n`;
  sampleText += `preferredCheckInTime: "${host.preferredCheckInTime}"\n`;
  sampleText += `preferredCheckOutTime: "${host.preferredCheckOutTime}"\n`;
  sampleText += `responseTimeHours: ${host.responseTimeHours}\n`;
  sampleText += `houseRules: "${host.houseRules}"\n`;
  sampleText += `propertyTypesOffered: [${host.propertyTypesOffered.map(p => `"${p}"`).join(', ')}]\n`;
  sampleText += `offeringHighlights: [${host.offeringHighlights.map(h => `"${h}"`).join(', ')}]\n`;
  sampleText += `hostPortfolioImages: [${host.hostPortfolioImages.map(img => `"${img}"`).join(', ')}]\n`;
  sampleText += `guestCapacity: ${host.guestCapacity}\n`;
  sampleText += `bedCount: ${host.bedCount}\n`;
  sampleText += `bedTypes: [${host.bedTypes.map(b => `{type: "${b.type}", count: ${b.count}}`).join(', ')}]\n`;
  sampleText += `nightlyRateUsd: ${host.nightlyRateUsd}\n`;
  sampleText += `payLaterAllowed: ${host.payLaterAllowed}\n`;
  sampleText += `payoutPercentage: ${host.payoutPercentage}\n`;
  sampleText += `cancellationPolicy: "${host.cancellationPolicy}"\n`;
  sampleText += `totalListings: ${host.totalListings}\n`;
  sampleText += `averageRating: ${host.averageRating}\n`;
  sampleText += `reviewCount: ${host.reviewCount}\n`;
  sampleText += `responseRate: ${host.responseRate}\n`;
  sampleText += `hostedProperties: Array(${host.hostedProperties.length})\n`;
  
  host.hostedProperties.forEach((prop, propIndex) => {
    sampleText += `  Property ${propIndex + 1}:\n`;
    sampleText += `    propertyName: "${prop.propertyName}"\n`;
    sampleText += `    propertyType: "${prop.propertyType}"\n`;
    sampleText += `    description: "${prop.description}"\n`;
    sampleText += `    guestCapacity: ${prop.guestCapacity}\n`;
    sampleText += `    bedCount: ${prop.bedCount}\n`;
    sampleText += `    bedroomCount: ${prop.bedroomCount}\n`;
    sampleText += `    bathroomCount: ${prop.bathroomCount}\n`;
    sampleText += `    amenities: [${prop.amenities.slice(0, 5).map(a => `"${a}"`).join(', ')}...] (${prop.amenities.length} total)\n`;
    sampleText += `    images: [${prop.images.slice(0, 2).map(img => `"${img}"`).join(', ')}...] (${prop.images.length} total)\n`;
    sampleText += `    nightlyRateUsd: ${prop.nightlyRateUsd}\n`;
    sampleText += `    payLaterAllowed: ${prop.payLaterAllowed}\n`;
    sampleText += `    cancellationPolicy: "${prop.cancellationPolicy}"\n`;
    sampleText += `    bookingCapacity: ${prop.bookingCapacity}\n`;
    sampleText += `    maxGuests: ${prop.maxGuests}\n`;
    sampleText += `    minimumStay: ${prop.minimumStay}\n`;
    sampleText += `    maximumStay: ${prop.maximumStay}\n`;
    sampleText += `    sizeSqMeters: ${prop.sizeSqMeters}\n`;
    sampleText += `    floorNumber: ${prop.floorNumber}\n`;
    sampleText += `    hasElevator: ${prop.hasElevator}\n`;
    sampleText += `    hasParking: ${prop.hasParking}\n`;
    sampleText += `    hasPool: ${prop.hasPool}\n`;
    sampleText += `    hasGym: ${prop.hasGym}\n`;
    sampleText += `    hasWiFi: ${prop.hasWiFi}\n`;
    sampleText += `    hasAirConditioning: ${prop.hasAirConditioning}\n`;
    sampleText += `    hasHeating: ${prop.hasHeating}\n`;
    sampleText += `    hasKitchen: ${prop.hasKitchen}\n`;
    sampleText += `    hasWasher: ${prop.hasWasher}\n`;
    sampleText += `    hasDryer: ${prop.hasDryer}\n`;
    sampleText += `    hasTV: ${prop.hasTV}\n`;
    sampleText += `    hasWorkspace: ${prop.hasWorkspace}\n`;
    sampleText += `    smokingAllowed: ${prop.smokingAllowed}\n`;
    sampleText += `    petsAllowed: ${prop.petsAllowed}\n`;
    sampleText += `    partiesAllowed: ${prop.partiesAllowed}\n`;
    sampleText += `    childrenAllowed: ${prop.childrenAllowed}\n`;
    sampleText += `    checkInTime: "${prop.checkInTime}"\n`;
    sampleText += `    checkOutTime: "${prop.checkOutTime}"\n`;
    sampleText += `    securityDeposit: ${prop.securityDeposit}\n`;
    sampleText += `    cleaningFee: ${prop.cleaningFee}\n`;
    sampleText += `    serviceFee: ${prop.serviceFee}\n`;
    sampleText += `    taxesAndFees: ${prop.taxesAndFees}\n`;
    sampleText += `    weeklyDiscount: ${prop.weeklyDiscount}\n`;
    sampleText += `    monthlyDiscount: ${prop.monthlyDiscount}\n`;
    sampleText += `    instantBook: ${prop.instantBook}\n`;
    sampleText += `    superhost: ${prop.superhost}\n`;
  });
  
  sampleText += `createdAt: ${host.createdAt}\n`;
  sampleText += `updatedAt: ${host.updatedAt}\n\n`;
});

fs.writeFileSync('sample-5-hosts.txt', sampleText);
console.log('Sample 5 hosts saved to sample-5-hosts.txt');

console.log('\nGeneration complete!');
console.log(`Total hosts generated: ${hosts.length}`);
console.log(`Countries covered: ${countryNames.length}`);
console.log(`Hotels per country average: ${(hosts.length / countryNames.length).toFixed(1)}`);
