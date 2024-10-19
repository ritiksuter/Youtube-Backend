import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const response = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`);
        console.log("DATABASE connected successfully", response.connection.host);
    }
    catch (error) {
        console.log("Some error occured while connecting to DATABASE", error);
        process.exit();
    }
}

export { connectDB };