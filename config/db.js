import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            dbName: 'serene'
        });
        console.log(`Connected to MongoDb ${conn.connection.host}`.bgGreen.black);
    } catch (error) {
        console.log(`Error in MongoDB ${error}`.bgMagenta.white);
    }
};

export default connectDB;
