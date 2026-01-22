import { Schema, model } from "mongoose";

const inviteSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

export const Invite = model("Invite", inviteSchema);
