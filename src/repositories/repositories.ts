import * as Schemas from "../schemas/schemas.ts";
type User = Schemas.User;
type Users = Schemas.Users;

type Entity = Schemas.Basic;

export interface Repository<TEntity extends Entity> {
  name: string;
  closeConnection(): Promise<void>;
  find(query: Partial<TEntity>): Promise<TEntity>;
  findAll(): Promise<TEntity[]>;
  findByUuid(uuid: string): Promise<TEntity>;
  updateWithUuid(uuid: string, up: Partial<TEntity>): Promise<TEntity>;
  insertOne(thing: TEntity): Promise<TEntity>;
}

export * from "./mongo.repository.ts";
export * from "./surreal.repository.ts";
