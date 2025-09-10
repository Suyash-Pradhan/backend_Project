import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Not authorized , no token")
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select("-password -refreshtoken")
        if (!user) {
            throw new ApiError(401, " user not found")
        }
        req.user = user
        next()
    } catch (error) {
        console.log("tera dhyan kidhar h ke tera error edhar h", error);
        throw new ApiError(401, "Not authorized , token failed")
    }
})