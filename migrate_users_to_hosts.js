// Script to migrate hosts from 'users' collection to 'hosts' collection
// Run with: mongosh "mongodb+srv://..." migrate_users_to_hosts.js

try {
  // 1. Find all users with role "HOST" in the 'users' collection
  const hostsInUsers = db.users.find({ role: "HOST" }).toArray();

  if (hostsInUsers.length === 0) {
    print("No hosts found in 'users' collection to migrate.");
  } else {
    print("Found " + hostsInUsers.length + " hosts in 'users' collection.");

    // 2. Insert them into 'hosts' collection
    const insertResult = db.hosts.insertMany(hostsInUsers);
    print("Inserted " + insertResult.insertedIds.length + " hosts into 'hosts' collection.");

    // 3. Remove them from 'users' collection to avoid duplication/confusion
    // (Optional: you might want to keep them if you are unsure, but the app uses split collections)
    const deleteResult = db.users.deleteMany({ role: "HOST" });
    print("Removed " + deleteResult.deletedCount + " hosts from 'users' collection.");

    print("Migration successful.");
  }

} catch (e) {
  print("Error during migration:");
  print(e);
}
