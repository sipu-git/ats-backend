import type { Request, Response } from "express";

export const adminLogin = async (req:Request,res:Response) =>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"Email and password fields missing!"})
        }
        if(email !== process.env.ADMIN_EMAIL){
            return res.status(401).json({message:"Email field is mismatching!"})
        }
        if(password !==process.env.ADMIN_PASSWORD){
            return res.status(400).json({message:"Password field is required!"})
        }
        return res.status(201).json({message:"Admin Login successfully!"})
    } catch (error) {
        console.error("Admin login failed!");
        return res.status(500).json({message:"Admin Login failed!"})
    }
}