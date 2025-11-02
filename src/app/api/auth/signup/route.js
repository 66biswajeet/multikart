import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try{
        await dbConnect();
        const {
            name, email, country_code, phone, password, address, city, state, country, zip, store_name, store_description
        } = await request.json();
        if(!name || !email || !country_code || !phone || !password || !address || !city || !state || !country || !zip || !store_name || !store_description){
            return NextResponse.json({success: false, message : "Please provide all required fields", data: null}, {status : 400});
        }

        const existingUser = await User.findOne({ email });
        if(existingUser){
            return NextResponse.json({success: false, message : "User already exists", data: null}, {status : 400});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            country_code,
            phone,
            password: hashedPassword,
            address,
            city,
            state,
            country,
            zip,
            store_name,
            store_description
        });
        await newUser.save();

        return NextResponse.json({success: true, message : "User created successfully", data: newUser}, {status : 201});
    }
    catch(err){
        console.log(err);
        return NextResponse.json({success: false, message : "Internal Server Error", data: null}, {status : 500});
    }
}
