import { Schemas } from "@Schemas";

export type KeyInKeys<T> = { [K in keyof T]: T[K] };

export interface RepositoriesRepository<T extends Schemas.Schema> {
  name: string;

  closeConnection(): Promise<void>;

  find(query: KeyInKeys<T>): Promise<T>;

  findAll(): Promise<T[]>;

  update(query: KeyInKeys<T>, up: KeyInKeys<T>): Promise<T>;

  insertOne(thing: T): Promise<T>;

  delete(query: KeyInKeys<T>): Promise<T>;
}

export class RepositoryError {
  message: string;
  public constructor(message: string) {
    this.message = message;
  }
}
