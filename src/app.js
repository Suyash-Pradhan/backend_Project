import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import logger from './utils/logger.js';
import { errorHandler } from './middlewares/error.middleware.js';

import userRouter from './routes/user.router.js';
import videoRouter from './routes/video.router.js';
import subscriptionRouter from './routes/subscription.router.js';
import dashboardRouter from './routes/dashboard.router.js';
import likeRouter from './routes/like.router.js';
import healtcheckRouter from './routes/healthcheck.router.js';
import commentRouter from './routes/comment.router.js';
import playlistRouter from './routes/playlist.router.js';
import tweetRouter from './routes/tweet.router.js';

const app = express();

// Security Middlewares
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true, 
    legacyHeaders: false, 
});
app.use('/api', limiter);

// Logging Middleware using Winston and Morgan
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
    morgan(morganFormat, {
        stream: { write: (message) => logger.http(message.trim()) },
    })
);
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//router called

app.use('/api/v1/users',userRouter); 
app.use('/api/v1/videos',videoRouter); 
app.use('/api/v1/subscriptions',subscriptionRouter); 
app.use('/api/v1/dashboard',dashboardRouter); 
app.use('/api/v1/likes',likeRouter); 
app.use('/api/v1/comments',commentRouter);
app.use('/api/v1/playlist',playlistRouter);
app.use('/api/v1/tweets',tweetRouter);
app.use('/api/v1/healthcheck',healtcheckRouter); 

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

export {app};