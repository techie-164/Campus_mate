import {DB_Name} from "../constants.js";
import mongoose from "mongoose";

const connectDB = async() => {
    try{
        const connection = await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`);
        console.log(`MongoDB connected: ${connection.connection.host}`);
    }
    catch(error){
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default connectDB;