import { Repository } from "../repositories/repositories.ts";
import * as Schemas from "../schemas/schemas.ts";
import argon2 from "argon2";
type Role = Schemas.Role;
type User = Schemas.User;
const User = Schemas.User;
const Role = Schemas.Role;

export class UserServices {
  constructor(private readonly repository: Repository<User>) {}

  async create(user: User): Promise<User> {
    user = await User.parseAsync(user);

    user.password = await argon2.hash(user.password);

    try {
      await this.repository.find({ email: user.email });
    } catch (e) {
      const new_user = await this.repository.insertOne(user);

      return new_user;
    }

    throw new Error("EMAIL_IN_USE");
  }

  async signUser({ email, password }: { email: string; password: string }) {
    const user = await this.repository.find({ email });
    const match = await argon2.verify(user.password, password);

    return match;
  }

  async createPartial(user: Partial<User>): Promise<User> {
    user = await User.partial().parseAsync(user);

    try {
      await this.repository.find({ email: user.email });
    } catch (e) {
      const new_user = await this.repository.insertOne(user);

      return new_user;
    }

    throw new Error("EMAIL_IN_USE");
  }

  async addRole(id: string, role: Role): Promise<User> {
    const { roles } = await this.repository.findByUuid(id);

    if (roles.includes(role)) throw new Error("ALREADY_HAVE_ROLE");

    roles.push(role);

    const updated = await this.repository.updateWithUuid(id, { roles });

    return updated;
  }

  async removeRole(id: string, role: Role): Promise<User> {
    const { roles } = await this.repository.findByUuid(id);

    if (!roles.includes(role)) throw new Error("DONT_HAVE_ROLE");

    const new_roles = roles.filter((r) => r !== role);

    const updated = await this.repository.updateWithUuid(id, {
      roles: new_roles,
    });

    return updated;
  }
}
