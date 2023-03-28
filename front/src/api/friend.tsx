import { axiosToken } from "./axios";
import { AxiosResponse } from "axios";

export const deleteRequest = async (userId: number) => {
  try {
    const sendingReq: AxiosResponse = await (
      await axiosToken()
    ).get("users/destroy-friend-request-by-userid/" + userId);
    console.log(JSON.stringify(sendingReq.data));
    return sendingReq.data;
  } catch (err: any) {
    console.log("error getme");
    if (!err?.response) {
    } else if (err.response?.status === 403) {
    } else {
    }
    return "" as string;
  }
};
export const refuseRequest = async (userId: number) => {
  try {
    const sendingReq: AxiosResponse = await (
      await axiosToken()
    ).get("users/decline-friend-request-by-userid/" + userId);
    console.log(JSON.stringify(sendingReq.data));
    return sendingReq.data;
  } catch (err: any) {
    console.log("error getme");
    if (!err?.response) {
    } else if (err.response?.status === 403) {
    } else {
    }
    return err;
  }
};
export const acceptRequest = async (userId: number) => {
  try {
    const sendingReq: AxiosResponse = await (
      await axiosToken()
    ).get("users/accept-friend-request-by-userid/" + userId);
    console.log(JSON.stringify(sendingReq.data));
    return sendingReq.data;
  } catch (err: any) {
    console.log("error getme");
    if (!err?.response) {
    } else if (err.response?.status === 403) {
    } else {
    }
    return "" as string;
  }
};
