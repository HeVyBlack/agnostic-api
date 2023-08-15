import * as Schemas from "../schemas/schemas.ts";
import { Repository } from "./repositories.ts";

type User = Schemas.User;
type Users = Schemas.Users;

export class MockRepository implements Repository {
  private constructor() {}

  private static instance: MockRepository;

  private db: Users = [];

  public static async getInstance() {
    if (!MockRepository.instance) {
      MockRepository.instance = new MockRepository();
    }

    return MockRepository.instance;
  }

  closeConnection(): Promise<void> {
    return;
  }

  async findAll(): Promise<Users> {
    return this.db;
  }

  async findById(id: string): Promise<User> {
    const user = this.db.find((u) => u.id === id);

    if (!user) throw new Error("USER_NOT_FOUND");

    return user;
  }

  async findByCode(code: string): Promise<User> {
    const user = this.db.find((u) => u.code === code);

    if (!user) throw new Error("USER_NOT_FOUND");

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.db.find((u) => u.email === email);

    if (!user) throw new Error("USER_NOT_FOUND");

    return user;
  }

  async updateWithId(id: string, up: Partial<User>): Promise<User> {
    const user = this.db.find((u) => u.id === id);

    if (!user) throw new Error("USER_NOT_FOUND");

    Object.assign(user, up);

    return user;
  }

  async updateWithCode(code: string, up: Partial<User>): Promise<User> {
    const user = this.db.find((u) => u.code === code);

    if (!user) throw new Error("USER_NOT_FOUND");

    Object.assign(user, up);

    return user;
  }

  async insertOne(user: User): Promise<User> {
    const index = this.db.push(user);

    return this.db[index];
  }
}
