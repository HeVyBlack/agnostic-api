import type { Repository } from "src/repositories.ts";
import * as Schemas from "../schemas.ts";

type Product = Schemas.Product;

export class ProductService {
  constructor(private readonly repository: Repository<Product>) {}

  async addProduct(product: Product) {
    const new_product = await this.repository.insertOne(product);

    return new_product;
  }

  async deleteProduct(uuid: string) {
    await this.repository.deleteByUuid(uuid);
  }

  async getProductByUuid(uuid: string) {
    const prodcut = this.repository.findByUuid(uuid);

    return await prodcut;
  }
}
