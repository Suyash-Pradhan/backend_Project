import {app} from './app.js'
import connectDB from "./db/index.js";
import Dotenv from "dotenv";

Dotenv.config({path: './env'})

connectDB().then(()=>{app.listen(process.env.PORT,()=>{
    console.log(`Server is listening at post: ${process.env.PORT}`);
})
}).catch((error)=>{
    console.log("Error in connecting to DB:",error)
    process.exit(1)
})
