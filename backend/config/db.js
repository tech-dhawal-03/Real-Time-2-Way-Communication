import mongoose from 'mongoose'
export const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

