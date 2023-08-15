import * as Schemas from "../schemas/schemas.ts";
type User = Schemas.User;
type Users = Schemas.Users;

export interface Repository {
  closeConnection(): Promise<void>;
  findAll(): Promise<Users>;
  findById(id: string): Promise<User>;
  findByCode(code: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  updateWithId(id: string, up: Partial<User>): Promise<User>;
  updateWithCode(code: string, up: Partial<User>): Promise<User>;
  insertOne(user: User): Promise<User>;
}

export * from "./mongo.repository.ts";
export * from "./surreal.repository.ts";
