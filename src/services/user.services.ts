import { type Repository } from "../repositories.ts";
import * as Schemas from "../schemas.ts";
import argon2 from "argon2";

type Role = Schemas.Role;
type User = Schemas.User;
type UserRaw = Schemas.UserRaw;
const UserRaw = Schemas.UserRaw;
type Product = Schemas.Product;
const Product = Schemas.Product;

export class UserServices {
  constructor(
    private readonly user_repository: Repository<UserRaw>,
    private readonly product_repository: Repository<Product>
  ) {}

  async create(user: UserRaw) {
    user = await UserRaw.parseAsync(user);

    user.password = await argon2.hash(user.password);

    try {
      await this.user_repository.find({ email: user.email });
    } catch (e) {
      const new_user = await this.user_repository.insertOne(user);

      return new_user;
    }

    throw new Error("EMAIL_IN_USE");
  }

  async signUser({ email, password }: Pick<User, "email" | "password">) {
    const user = await this.user_repository.find({ email });
    const match = await argon2.verify(user.password, password);

    return match;
  }

  async createPartial(user: UserRaw) {
    user = await UserRaw.parseAsync(user);

    try {
      await this.user_repository.find({ email: user.email });
    } catch (e) {
      const new_user = await this.user_repository.insertOne(user);

      return new_user;
    }

    throw new Error("EMAIL_IN_USE");
  }

  async addRoleToUser(uuid: string, role: Role) {
    const { roles = [] } = await this.user_repository.findByUuid(uuid);

    if (roles.includes(role)) throw new Error("ALREADY_HAVE_ROLE");

    roles.push(role);

    const updated = await this.user_repository.updateWithUuid(uuid, { roles });

    return updated;
  }

  async removeRole(id: string, role: Role) {
    const { roles } = await this.user_repository.findByUuid(id);

    if (!roles.includes(role)) throw new Error("DONT_HAVE_ROLE");

    const new_roles = roles.filter((r) => r !== role);

    const updated = await this.user_repository.updateWithUuid(id, {
      roles: new_roles,
    });

    return updated;
  }

  async addProduct(uuid: string, product: Product) {
    product.owner = uuid;

    product = await Product.parseAsync(product);

    const user_raw = await this.user_repository.findByUuid(uuid);

    await this.product_repository.insertOne(product);

    if (!user_raw.products) user_raw.products = [];

    user_raw.products.push(product.uuid);

    await this.user_repository.updateWithUuid(uuid, {
      products: user_raw.products,
    });

    return product;
  }

  async deleteProduct(user_uuid: string, product_uuid: string) {
    const { products } = await this.user_repository.findByUuid(user_uuid);

    await this.product_repository.deleteByUuid(product_uuid);

    if (products.includes(product_uuid)) {
      const new_products = products.filter((p) => p !== product_uuid);

      await this.user_repository.updateWithUuid(user_uuid, {
        products: new_products,
      });

      await this.product_repository.deleteByUuid(product_uuid);
    }
  }

  private async populateProducts(raw_products: UserRaw["products"] = []) {
    const populate_products: User["products"] = [];

    raw_products.forEach(async (value, index) => {
      try {
        const product = await this.product_repository.findByUuid(value);
        populate_products[index] = product;
      } catch (e) {}
    });

    return populate_products;
  }

  async rawToUser(user_raw: UserRaw) {
    const populate_products = await this.populateProducts(user_raw.products);

    return { ...user_raw, products: populate_products };
  }

  async getUserRawByUuid(uuid: string) {
    let user_raw = await this.user_repository.findByUuid(uuid);

    user_raw = await UserRaw.parseAsync(user_raw);

    return user_raw;
  }

  async getUserByUuid(uuid: string) {
    const user_raw = await this.getUserRawByUuid(uuid);

    const user = await this.rawToUser(user_raw);

    return user;
  }
}
