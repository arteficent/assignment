import { Request } from "express"
export interface IGetUserAuthInfoRequest extends Request {
    user: MyObjLayout // or any other type
}
export interface MyObjLayout {
    name: string;
}