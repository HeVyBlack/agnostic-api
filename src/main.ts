import { v4 } from "uuid";
import * as Repositories from "./repositories.ts";
import * as Schemas from "./schemas.ts";
import * as Services from "./services.ts";

type UserRaw = Schemas.UserRaw;
type Product = Schemas.Product;

const MongoRepository = Repositories.MongoRepository;
const SurrealRepository = Repositories.SurrealRepository;

const user: Schemas.UserRaw = {
  email: "test@test.com",
  password: "SUPER_SECRET_PASSWORD",
  roles: ["user"],
  verify_email: false,
  uuid: v4(),
  products: [],
};

const product: Schemas.Product = {
  brand: "Nescafe",
  name: "Pariso",
  price: "20.000$",
  uuid: v4(),
  owner: user.uuid,
};

type UserServices = Services.UserServices;
const UserServices = Services.UserServices;

async function Main() {
  const user_mongo = await MongoRepository.getInstance<UserRaw>("users");

  const product_surreal = await SurrealRepository.getInstance<Product>(
    "products"
  );
  try {
    console.log("Combine MongoDb and Surreal");
    console.log(
      "Will create a product and will associate the product with the user"
    );
    console.log("After that, will remove the product");
    const service = new UserServices(user_mongo, product_surreal);

    const new_user = await service.create(user);
    console.log("New user created!");

    console.log("New user's products:");
    console.log(new_user.products);

    console.log("New product added!");
    const new_product = await service.addProduct(new_user.uuid, product);

    console.log("Get raw user (product id's only!)");
    let user_raw = await service.getUserRawByUuid(new_user.uuid);

    console.log("raw user's products:");
    console.log(user_raw.products);

    console.log("Populate raw user's products");
    const user_populated = await service.rawToUser(user_raw);

    console.log("Products populated:");
    console.log(user_populated.products);

    console.log("Remove product");
    await service.deleteProduct(new_user.uuid, new_product.uuid);

    console.log("Get again raw user");
    user_raw = await service.getUserRawByUuid(new_user.uuid);

    console.log("Raw user without product:");
    console.log(user_raw.products);
  } catch (e) {
    console.error(e);
  } finally {
    await user_mongo.closeConnection();
    await product_surreal.closeConnection();
  }
}

Main();
