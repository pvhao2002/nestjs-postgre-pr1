export class LoginUserInput {
  // Gets only validated if it's part of the request's body
  public email: string;
  password: string;
  lat: number;
  long: number;
}

export class SignupUserInput {
  public email: string;
  password: string;

}
