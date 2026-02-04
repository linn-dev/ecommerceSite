import bcrypt from 'bcryptjs';
import prisma from '../config/database.js'
import { generateToken } from "../utils/jwt.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async(req, res, next) => {
    try{
        const {email, password, firstName, lastName, phone} = req.body; // cookie-parser

        if(!email || !password || !firstName || !lastName || !phone){
            res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //** Create user in database **\\
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone: phone
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
            }
        });

        //** Create empty cart for user **\\
        await prisma.cart.create({
            data: {
                userId: user.id
            }
        });

        const token = await generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 24hr in millisecond
        });

        res.status(201).json({
            success: true,
            message: "Registered successfully",
        });

    }catch(err){
        next(err);
    }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if(!user) {
            res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const passwordValid = await bcrypt.compare(password, user.password);

        if(!passwordValid){
            res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = await generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        //** Sent respond without password **\\
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: "Login successfully",
            user: userWithoutPassword,
        });

    }catch(err){
        next(err);
    }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({
        success: true,
        message: "Logout successfully",
    })
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async(req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
}