import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const SALT_ROUND = 10;
import User from '../Models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();


export const signup = async(req, res) => {
    try{
        const user = req.body;
        if(!user.name || !user.email || !user.password){
            return res.status(400).json({error:"Name, Email and Password are required"})
        }else{
            const existingUser = await User.findOne({ email: user.email})
            if(existingUser) return res.status(400).json({error:"Email already registered."})
            else {
                const hashedPwd = await bcrypt.hash(user.password, SALT_ROUND);
                const newUser = await User.create({
                    name:user.name,
                    email:user.email,
                    password:hashedPwd,
  
                });
                res.status(201).json(newUser);
            }
        }
    }catch(err){
        res.status(500).json({error: "Server Error", e:err});
    }
}

export const login = async(req,res) => {
    try{
        const user = req.body;
        if(!user.email || !user.password){
            return res.status(400).json({error: "Email and Password are required!!"});
        }
        const existingUser = await User.findOne({email:user.email})
        if(!existingUser){
            return res.status(400).json({error: "Email not found."})
        }
        const isMatch = await bcrypt.compare(user.password, existingUser.password);
        if(!isMatch) return res.status(401).json({error: "Invalid Password"});
        const tokenUser = {id:existingUser._id, name:existingUser.name}
        const token = jwt.sign(
            tokenUser,
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        )
        res.json({token: token, user:existingUser})
    }catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Server Error",
            e: err.message
        });
    }
}
