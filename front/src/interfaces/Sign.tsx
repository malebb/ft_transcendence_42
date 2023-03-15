export interface TokensInterface{
    access_token: string,
    crea_time: Date,
    expireIn: number,
    refresh_token: string,
  }
export interface ResponseInterface{
  tokens: TokensInterface | undefined,
  id: number | undefined,
}

export interface SignInterface {
  tokens: TokensInterface;
  isTfa: boolean;
  userId: number;
  username: string;
}