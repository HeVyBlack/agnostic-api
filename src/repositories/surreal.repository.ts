import * as Schemas from "../schemas/schemas.ts";
import { Repository } from "./repositories.ts";
import { Surreal } from "surrealdb.js";

type User = Schemas.User;
type Users = Schemas.Users;

export class SurrealRepository implements Repository {
  private constructor() {}

  private static instance: SurrealRepository;

  private db = new Surreal("http://127.0.0.1:8000/rpc");

  public static async getInstance() {
    if (!SurrealRepository.instance) {
      SurrealRepository.instance = new SurrealRepository();

      await SurrealRepository.instance.db.signin({
        user: "api",
        pass: "root",
      });

      await SurrealRepository.instance.db.use({
        ns: "api",
        db: "users",
      });
    }

    return SurrealRepository.instance;
  }

  async closeConnection(): Promise<void> {
    await this.db.close();
  }

  async findAll(): Promise<Users> {
    const [{ result }] = await this.db.query<Users[]>("SELECT * FROM users;");

    return result.map((u) => {
      u.id = u.id.replace(/(^users:⟨|⟩$)/g, "");
      return u;
    });
  }

  private handleResult(result: User[]) {
    const user = result[0];

    if (!user) throw new Error("USER_NOT_FOUND");

    user.id = user.id.replace(/(^users:⟨|⟩$)/g, "");

    return user;
  }

  async findById(id: string): Promise<User> {
    const [{ result }] = await this.db.query<Users[]>(
      `SELECT * FROM users WHERE id == users:⟨${id}⟩`
    );

    return this.handleResult(result);
  }

  async findByCode(code: string): Promise<User> {
    const [{ result }] = await this.db.query<Users[]>(
      "SELECT * FROM users WHERE code == $code",
      { code }
    );

    return this.handleResult(result);
  }

  async findByEmail(email: string): Promise<User> {
    const [{ result }] = await this.db.query<Users[]>(
      "SELECT * FROM users WHERE email == $email",
      { email }
    );

    return this.handleResult(result);
  }

  async updateWithId(id: string, up: Partial<User>): Promise<User> {
    const [{ result }] = await this.db.query<Users[]>(
      `UPDATE users:⟨${id}⟩ MERGE $up`,
      { up }
    );

    return this.handleResult(result);
  }

  async updateWithCode(code: string, up: Partial<User>): Promise<User> {
    const [{ result }] = await this.db.query<Users[]>(
      "UPDATE users MERGE $up WHERE code == $code",
      { up, code }
    );

    return this.handleResult(result);
  }

  async insertOne(user: User) {
    try {
      const [inserted] = await this.db.create("users", user);

      return inserted;
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.endsWith("already exists"))
          throw new Error("ALREADY_EXISTS");
      }
      throw e;
    }
  }
}
