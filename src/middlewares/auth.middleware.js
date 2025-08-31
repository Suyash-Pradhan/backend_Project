import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.acesstoken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(401,"Not authorized , no token")
        }
            const user =await  User.findById(decoded._id).select("-password -refreshtoken")
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,"Not authorized , token failed")
    }
})