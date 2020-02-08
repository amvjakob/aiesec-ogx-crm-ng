export class AuthenticationUser {
  constructor(email: string, password: string) {
    this._email = email;
    this._pwd = password;
  }

  public _email: string;
  public _pwd: string;
}