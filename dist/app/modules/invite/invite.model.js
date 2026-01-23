"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invite = void 0;
const mongoose_1 = require("mongoose");
const inviteSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ["STAFF", "ADMIN", "MANAGER"],
        default: "STAFF",
    },
    token: {
        type: String,
        required: true,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    acceptedAt: {
        type: Date,
    },
}, { timestamps: true });
exports.Invite = (0, mongoose_1.model)("Invite", inviteSchema);
