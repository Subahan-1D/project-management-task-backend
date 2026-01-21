import { Response } from "express";

interface TMeta {
  // page: number;
  // limit: number;
  // totalPage: number;
  total: number;
}

interface TResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
  meta ?: TMeta;
}

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    statusCode: data.statusCode,
    message: data.message,
    success: data.success,
    meta: data.meta,
    data: data.data,
  });
};


export default sendResponse;
