import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
// import { on } from 'nodemon';
import UplodeonCloudnary from '../utils/cloudnarry.js';
import{ApiResponse} from '../utils/ApiResponse.js'


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
        new ApiResponse(201,"User created successfully",createduser)
    )



});
export { registerUser }