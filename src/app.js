import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.router.js';
import videoRouter from './routes/video.router.js';
import subscriptionRouter from './routes/subscription.router.js';
import dashboardRouter from './routes/dashboard.router.js';
import likeRouter from './routes/like.router.js';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//router called

app.use('/api/v1/user',userRouter); 
app.use('/api/v1/user',videoRouter); 
app.use('/api/v1/user',subscriptionRouter); 
app.use('/api/v1/user',dashboardRouter); 
app.use('/api/v1/user',likeRouter); 

export {app};