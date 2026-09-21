import mongoose  from "mongoose";


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB is connected");

    // Automatically drop legacy unique index on phoneNumber if it exists in MongoDB
    try {
      const userCol = mongoose.connection.collection("users");
      const indexes = await userCol.indexes();
      const phoneIndex = indexes.find((idx) => idx.name === "phoneNumber_1");
      if (phoneIndex) {
        await userCol.dropIndex("phoneNumber_1");
        console.log("Dropped legacy phoneNumber_1 index successfully from users collection");
      }
    } catch (idxError) {
      // Ignore if collection does not exist yet or index already dropped
      console.warn("User index cleanup check:", idxError.message);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};


export default connectDB