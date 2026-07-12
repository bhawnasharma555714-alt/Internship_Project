import mongoose from "mongoose";

const connectDb = async () => {
    try {
        console.log("URI exists:", !!process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("Mongoose Connected!!");
    } catch (err) {
        console.log("Error name:", err.name);
        console.log("Error message:", err.message);

        if (err.cause) {
            console.log("Cause:", err.cause);
        }

        process.exit(1);
    }
};

export default connectDb;