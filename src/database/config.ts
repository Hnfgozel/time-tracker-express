import mongoose from 'mongoose';

const URI = process.env.DB_URI as string;

const connectDB = () => {
    mongoose.connect(URI);

    const db = mongoose.connection;

    db.once("open", () => {
        console.log("Database connected:", URI);
    });

    db.on("error", (err) => {
        console.error("Database connection error: ", err);
    });
};

export default connectDB;
