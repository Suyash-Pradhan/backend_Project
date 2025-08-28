import mongoose from "mongoose";
import { DB_NAME } from "../constents.js";

const connectDB = async()=>{
    try{
       const connectionInstance = await mongoose.connect(`${process.env.MONOGO_URL}/${DB_NAME}`)
       console.log("Connection instance is -:")
    //    console.log("Connection instance is -:",connectionInstance)
       console.log(`\n Mongodb Connected Sucessfully on Host:${connectionInstance.connection.host}`)

    }catch(error){
        console.log("Connection Error:",error)
        process.exit(1)
    }
}

export default connectDB;