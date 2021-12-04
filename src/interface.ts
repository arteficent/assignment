import { Request } from "express"
export interface IGetUserAuthInfoRequest extends Request {
    username: string // or any other type
}
export interface transObj {
    username: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    timestamp: number;
}
export interface userObj {
    name: string;
    username: string;
    password: string;
    net_balance: number;
    amount_credited: number;
    amount_debited: number;
}