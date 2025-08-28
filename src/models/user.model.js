import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import { JsonWebTokenError } from "jsonwebtoken";



const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowecase:true,
        trim:true,
        index:true //to make serchable - so that it can come in DB search
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
        
    },
    fullname:{
        type:String,
        required:true,
        unique:true,
        trim:true
        
    },
    avatar:{
        type:String,
        required:true,
    },
    coverimage:{
        type:String,
    },
    watchHistory:{
        type:Schema.Types.ObjectId,
        ref:'Video'
    },
    password:{
        type:String,
        required:[true,'password zaruri hai']
    },
    refreshToken:{
        type:String,
        
    }
},{timestamps:true})

UserSchema.pre("save",async function (next){
    if(this.isModified("password")){

        this.password = await bcrypt.hash(this.password,10)
        next()
    }
    else{return}
})
UserSchema.methods.isPasswordCorrect = async function (password){
  return await  bcrypt.compare(password,this.password)
}
UserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            fullname:this.fullname,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:process.env.ACCESS_TOKEN_EXPIARY
        }
    )
}
UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expiresIn:process.env.REFRESH_TOKEN_EXPIARY
        }
    )
}

export const User = mongoose.model('user','UserSchema')