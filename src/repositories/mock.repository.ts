import { type Repository } from "../repositories.ts";
import { type Basic } from "../schemas.ts";

export class MockRepository<T extends Basic> implements Repository<T> {
  name: string;

  private constructor(name: string) {
    this.name = name;
  }

  private db: T[] = [];

  public static async getInstance(name: string) {
    const instance = new MockRepository(name);

    return instance;
  }

  async closeConnection(): Promise<void> {
    return;
  }

  async find(query: Partial<T>): Promise<T> {
    const keys = Object.keys(query) as (keyof T)[];

    if (keys.length === 0) throw new Error("INVALID_QUERY");

    const found = this.db.find((v) => {
      let is_found = false;
      keys.forEach((k) => {
        is_found = v[k] === query[k];
      });
      return is_found;
    });

    if (!found) throw new Error("NOT_FOUND");

    return found;
  }

  async findAll(): Promise<T[]> {
    return this.db;
  }

  async findByUuid(uuid: string): Promise<T> {
    const found = this.db.find((u) => u.uuid === uuid);

    if (!found) throw new Error("NOT_FOUND");

    return found;
  }

  async updateWithUuid(uuid: string, up: Partial<T>): Promise<T> {
    const user = this.db.find((u) => u.uuid === uuid);

    if (!user) throw new Error("USER_NOT_FOUND");

    Object.assign(user, up);

    return user;
  }

  async insertOne(thing: T): Promise<T> {
    const index = this.db.push(thing);

    return this.db[index]!;
  }

  async deleteByUuid(uuid: string): Promise<void> {
    this.db = this.db.filter((v) => v.uuid !== uuid);
  }
}
