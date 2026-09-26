const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config();

const User = require("./models/User");
const authenticateToken =
    require("./middleware/auth");

const app = express();

const PORT =
    process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ================================
// REGISTER
// ================================

app.post(
    "/api/auth/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;

            // Validation
            if (
                !name ||
                !email ||
                !password
            ) {
                return res.status(400).json({
                    message:
                        "Name, email and password are required"
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message:
                        "Password must contain at least 6 characters"
                });
            }


            // Check existing user
            const existingUser =
                await User.findOne({
                    email
                });

            if (existingUser) {
                return res.status(409).json({
                    message:
                        "Email already registered"
                });
            }


            // Hash password
            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );


            // Create user
            const user =
                await User.create({
                    name,
                    email,
                    password:
                        hashedPassword
                });


            res.status(201).json({
                message:
                    "Registration successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Registration failed"
            });
        }
    }
);


// ================================
// LOGIN
// ================================

app.post(
    "/api/auth/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (!email || !password) {
                return res.status(400).json({
                    message:
                        "Email and password are required"
                });
            }


            // Find user
            const user =
                await User.findOne({
                    email
                });


            if (!user) {
                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });
            }


            // Compare password
            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {
                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });
            }


            // Create JWT
            const token =
                jwt.sign(
                    {
                        userId:
                            user._id.toString(),

                        email:
                            user.email
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: "1h"
                    }
                );


            // HTTP-only cookie
            res.cookie(
                "token",
                token,
                {
                    httpOnly: true,

                    secure:
                        process.env.NODE_ENV ===
                        "production",

                    sameSite: "lax",

                    maxAge:
                        60 * 60 * 1000
                }
            );


            res.json({
                message:
                    "Login successful",

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Login failed"
            });
        }
    }
);


// ================================
// PROTECTED PROFILE
// ================================

app.get(
    "/api/profile",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                ).select(
                    "-password"
                );


            if (!user) {
                return res.status(404).json({
                    message:
                        "User not found"
                });
            }


            res.json({
                message:
                    "Protected route accessed",

                user
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Unable to load profile"
            });
        }
    }
);


// ================================
// LOGOUT
// ================================

app.post(
    "/api/auth/logout",
    (req, res) => {

        res.clearCookie("token");

        res.json({
            message:
                "Logout successful"
        });
    }
);


// ================================
// DATABASE
// ================================

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log(
            "MongoDB connected"
        );

        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running at http://localhost:${PORT}`
                );
            }
        );
    })

    .catch(error => {

        console.error(
            "MongoDB connection failed:",
            error
        );
    });