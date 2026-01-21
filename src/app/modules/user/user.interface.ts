

import { Types } from "mongoose";


export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",

}


export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",

}


export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  picture?: string;
  password?: string;
  address?: string;
  auths: IAuthProvider[];
  role: Role;
  isDeleted?: string;
  isVerified?: boolean;
  isActive?: IsActive;
  invitedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}