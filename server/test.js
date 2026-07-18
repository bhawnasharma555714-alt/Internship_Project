import mongoose from "mongoose";

const uri = "mongodb+srv://bhawna_Sharma:heightHIGH2893@bhawna-sharma.fi5psar.mongodb.net/collabconnect";

try {
  await mongoose.connect(uri);
  console.log("Connected!");
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}