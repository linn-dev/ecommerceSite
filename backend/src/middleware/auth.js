import { verifyToken } from "../utils/jwt.js";
import prisma from "../config/database.js"

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not register, please login"
            });
        }

        const decoded = verifyToken(token);

        if(!decoded) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid or expired"
            })
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
            }
        });

        if(!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        req.user = user;

        next();
    }catch (err) {
        return res.status(401).json({
            success: false,
            message: "Not authorized"
        })
    }
}

export const adminOnly = (req, res, next) => {
    if(req.user && req.user.role === "ADMIN") {
        next();
    }else {
        res.status(401).json({
            success: false,
            message: "Access denied. Admin Ony"
        })
    }
}