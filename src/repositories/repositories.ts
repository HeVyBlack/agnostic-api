import { Schemas } from "@Schemas";

export type KeyInKeys<T> = { [K in keyof T]: T[K] };

export interface RepositoriesRepository<T extends Schemas.Schema> {
  name: string;

  CloseConnection(): Promise<void>;

  Find<V extends keyof T>(query: Record<V, T[V]>): Promise<T>;

  FindAll(): Promise<T[]>;

  Update<V extends keyof T>(
    query: Record<V, T[V]>,
    up: KeyInKeys<T>
  ): Promise<T>;

  InsertOne(thing: T): Promise<T>;

  Delete<V extends keyof T>(query: Record<V, T[V]>): Promise<T>;
}

export class RepositoryError {
  message: string;
  public constructor(message: string) {
    this.message = message;
  }
}
