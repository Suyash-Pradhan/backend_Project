import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
// import { on } from 'nodemon';
import UplodeonCloudnary from '../utils/cloudnarry.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid)
        const acesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

        user.refreshtoken = refreshtoken
        await user.save({ ValidityState: false })

        return { acesstoken, refreshtoken }
    } catch (error) {
        throw new ApiError(500, "Error in generating access and refresh token")
    }
}
const registerUser = asyncHandler(async (req, res) => {
    // get the user details from frontend
    //  (validation)
    //  check if user already exists
    //  check for images and avtar
    //  uplode them to clpudnary
    //  create entry in db
    //  remove pass and refresh token from res
    //  check for user creation
    //     send back response


    const { fullname, username, email, password } = req.body;
    console.log("email", email);

    if (
        [fullname, username, email, password].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existeduser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existeduser) {
        throw new ApiError(409, "User already exists with this email or username")
    }

    const avtarlocal = req.files?.avatar[0]?.path
    const coverImagelocal = req.files?.coverImage[0]?.path

    if (!avtarlocal) {
        throw new ApiError(400, "Avatar is required")
    }

    const avater = await UplodeonCloudnary(avtarlocal);
    const coverImage = await UplodeonCloudnary(coverImagelocal);

    if (!avater) {
        throw new ApiError(500, "Error while uploding avatar to cloudnary")
    }

    const user = await User.create({
        fullname,
        username,
        email,
        password,
        avatar: avater.url,
        coverImage: coverImage?.url || ""
    })


    const createduser = await User.findById(user._id).select('-password -refreshToken')

    if (!createduser) {
        throw new ApiError(500, "Error in creating user")
    }



    res.status(201).json(
        new ApiResponse(201, createduser, "User created successfully")
    )



});

const loginUser = asyncHandler(async (req, res) => {
    //get user deatails from frontend
    //check user detauils can be email or username
    //check user exists or not
    //password match
    //generate access token and refresh token
    //send cookie

    const { username, email, password } = req.body;
    console.log("req.body", req.body);

    if (!(email || username)) {
        throw new ApiError(400, "Email or username is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPassValid = await user.isPasswordCorrect(password)

    if (!isPassValid) {
        throw new ApiError(401, "Invalid password")
    }

    const { acesstoken, refreshtoken } = await generateAccessAndRefreshToken(user._id)
    const loginduser = await User.findById(user._id).select('-password -refreshToken')
    const option = {
        httponly: true,
        secure: true
    }

    return res.status(200)
        .cookie("refreshToken", refreshtoken, option)
        .cookie("accessToken", acesstoken, option)
        .json(new ApiResponse(200,
            {
                user: loginduser, acesstoken, refreshtoken
            }
        ))
})

const logoutuser = asyncHandler(async (req, res) => {
    //get user id from req.user
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshtoken: undefined } },
        { new: true }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .clearcookie("refreshToken", options)
        .clearcookie("accessToken", options)
        .json(ApiResponse(200, {}, 'Logout successfull'))
}
)

const refreshacessToken = asyncHandler(async (req, res) => {
    const incomingRefreshtoken = req.cookies.refreshtoken || req.header("Authorization")?.replace("Bearer ", "")
    if (!incomingRefreshtoken) {
        throw new ApiError(401, "Not authorized , no token")
    }
    try {
        const decoded = jwt.verify(incomingRefreshtoken, process.env.REFRESH_TOKEN_SECRET);
        if (!decoded) {
            throw new ApiError(401, "Not authorized token failed")
        }

        const user = await User.findById(decoded._id)
        if (!user || user.refreshtoken !== incomingRefreshtoken) {
            throw new ApiError(401, "Not authorized token failed")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }
        const { acesstoken, refreshtoken } = await generateAccessAndRefreshToken(user._id)

        return res.status(200)
            .cookie("refreshToken", refreshtoken, options)
            .cookie("accessToken", acesstoken, options)
            .json(new ApiResponse(200,
                {
                    acesstoken, refreshtoken
                },
                "token refreshed successfully"
            ))
    } catch (error) {
        throw new ApiError(401, "Not authorized token failed")
    }
})

const chnagePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "password filed cannot be leave blank")
    }

    const user = await User.findById(req.user._id);
    const iscorrrectPasswordawait = user.isPasswordCorrect(oldPassword)
    if (!iscorrrectPasswordawait) {
        throw new ApiError(400, "Old password is incorrect")
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, "Password changed successfully"))

})


const chnageuserDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
    if (!fullname || !email) {
        throw new ApiError(400, "fullname and username cannot be blank")
    }

    const existeduser = await User.findOneAndUpdate(req.user._id, {
        $set: { fullname, email }
    },
        { new: true }
    ).select("-password ")

    res
        .status(200)
        .json(new ApiResponse(200, existeduser, "User details updated successfully"))
})

const changeAvatar = asyncHandler(async (req, res) => {
    const localAvtarPath = req.files?.path
    if (!localAvtarPath) {
        throw new ApiError(400, "Avatar is required")
    }
    const avatar = await UplodeonCloudnary(localAvtarPath);
    if (!avatar) {
        throw new ApiError(500, "Error while uploding avatar to cloudnary")
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: { avatar: avatar.url }
    }, { new: true }).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))

})
const changeCoverImage = asyncHandler(async (req, res) => {
    const localCoverImagePath = req.files?.path
    if (!localCoverImagePath) {
        throw new ApiError(400, "Avatar is required")
    }
    const CoverImage = await UplodeonCloudnary(localCoverImagePath);
    if (!CoverImage) {
        throw new ApiError(500, "Error while uploding coverImage to cloudnary")
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: { coverImage: CoverImage.url }
    }, { new: true }).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "coverImage updated successfully"))

})

const getcurrentuser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})
export {
    registerUser,
    loginUser,
    logoutuser,
    refreshacessToken,
    chnagePassword,
    chnageuserDetails,
    changeAvatar,
    changeCoverImage,
    getcurrentuser,
}