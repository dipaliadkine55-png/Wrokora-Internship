const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const TeamMember = require("./models/TeamMember");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Connect MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(
                `Server running at http://localhost:${PORT}`
            );
        });
    })
    .catch(error => {
        console.error(
            "MongoDB connection failed:",
            error
        );
    });


// GET all team members
app.get("/api/team", async (req, res) => {

    try {

        const members = await TeamMember.find();

        res.json(members);

    } catch (error) {

        res.status(500).json({
            message: "Unable to fetch team members"
        });
    }
});


// POST - Add team member
app.post("/api/team", async (req, res) => {

    try {

        const { name, role } = req.body;

        if (!name || !role) {
            return res.status(400).json({
                message: "Name and role are required"
            });
        }

        const member = await TeamMember.create({
            name,
            role,
            status: "Available"
        });

        res.status(201).json(member);

    } catch (error) {

        res.status(500).json({
            message: "Unable to add team member"
        });
    }
});


// PATCH - Update status
app.patch("/api/team/:id/status", async (req, res) => {

    try {

        const { status } = req.body;

        const allowedStatuses = [
            "Available",
            "Busy",
            "Away"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const member = await TeamMember.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!member) {
            return res.status(404).json({
                message: "Team member not found"
            });
        }

        res.json(member);

    } catch (error) {

        res.status(500).json({
            message: "Unable to update status"
        });
    }
});


// DELETE - Remove team member
app.delete("/api/team/:id", async (req, res) => {

    try {

        const member =
            await TeamMember.findByIdAndDelete(
                req.params.id
            );

        if (!member) {
            return res.status(404).json({
                message: "Team member not found"
            });
        }

        res.json({
            message: "Team member deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: "Unable to delete team member"
        });
    }
});