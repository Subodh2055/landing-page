export class User {
  constructor(
    public id: number,
    public username: string,
    public email: string,
    public role: string,
    public token?: string
  ) {}

  static fromJson(json: any): User {
    return new User(
      json.id,
      json.username,
      json.email,
      json.role,
      json.token
    );
  }

  toJson(): any {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      token: this.token
    };
  }

  hasRole(role: string): boolean {
    return this.role === role;
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  isUser(): boolean {
    return this.role === 'user';
  }
}
