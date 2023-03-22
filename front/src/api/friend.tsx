import axios from "axios";
import { axiosToken } from "./axios";
import { AxiosResponse } from "axios";
import { TokensInterface } from "src/interfaces/Sign";

export const deleteRequest = async (userId: number, token: TokensInterface, setToken: React.Dispatch<React.SetStateAction<TokensInterface | undefined>> ) => {
  try {
    const sendingReq: AxiosResponse = await (
      await axiosToken(token, setToken)
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
export const refuseRequest = async (userId: number, token: TokensInterface, setToken: React.Dispatch<React.SetStateAction<TokensInterface | undefined>> ) => {
  try {
    const sendingReq: AxiosResponse = await (
      await axiosToken(token, setToken)
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
export const acceptRequest = async (userId: number, token: TokensInterface, setToken: React.Dispatch<React.SetStateAction<TokensInterface | undefined>> ) => {
  try {
    const sendingReq: AxiosResponse = await (
      await axiosToken(token, setToken)
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
