import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{
    try{
       console.log("🔄 Attempting to connect to MongoDB...")
       console.log(`Connection URL: ${process.env.MONGO_URL}/${DB_NAME}`)
       
       const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`, {
           serverSelectionTimeoutMS: 10000,
           socketTimeoutMS: 45000,
       })
       
       console.log(`\n✅ MongoDB Connected Successfully!`)
       console.log(`📍 Host: ${connectionInstance.connection.host}`)
       console.log(`📁 Database: ${connectionInstance.connection.name}\n`)

    }catch(error){
        console.log("\n❌ MongoDB Connection FAILED!")
        console.log(`Error: ${error.message}\n`)
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
            console.log("💡 This error means your MongoDB cluster is not accessible.")
            console.log("\n🔧 SOLUTIONS:")
            console.log("1. ⏸️  Resume your paused cluster at: https://cloud.mongodb.com")
            console.log("2. 🌐 Check Network Access - whitelist your IP (0.0.0.0/0 for testing)")
            console.log("3. 🔐 Verify username/password in .env file")
            console.log("4. 💻 Use local MongoDB instead:")
            console.log("   - Install MongoDB Community: https://www.mongodb.com/try/download/community")
            console.log("   - Or run with Docker: docker run -d -p 27017:27017 mongo")
            console.log("   - Then change .env: MONGO_URL=mongodb://localhost:27017\n")
        }
        
        process.exit(1)
    }
}

export default connectDB;