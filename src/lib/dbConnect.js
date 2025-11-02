import mongoose from "mongoose";


const connection = {};

async function dbConnect(){
    // ✅ Check mongoose's actual connection state (not local variable)
    if (mongoose.connection.readyState === 1) {
        console.log("Already connected to the database");
        return;
    }

    // ✅ Wait if connection is in progress
    if (mongoose.connection.readyState === 2) {
        console.log("Connection in progress, waiting...");
        return new Promise((resolve) => {
            mongoose.connection.once('connected', resolve);
            mongoose.connection.once('error', resolve);
        });
    }

    try{
        await mongoose.connect(process.env.MONGO_URI || "");
        connection.isConnected = mongoose.connection.readyState === 1;
        console.log("Connected to the database");
    }
    catch(err){
        console.error("Database connection error:", err);
        throw err; // Let Next.js handle it, don't exit process
    }
}

export default dbConnect;