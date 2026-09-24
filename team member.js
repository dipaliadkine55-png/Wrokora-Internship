const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    role: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Available", "Busy", "Away"],
        default: "Available"
    }
});

module.exports = mongoose.model(
    "TeamMember",
    teamMemberSchema
);