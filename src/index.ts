import { v4 } from "uuid";
import {
  MongoRepository,
  Repository,
  SurrealRepository,
} from "./repositories/repositories.ts";
import * as Schemas from "./schemas/schemas.ts";
import { UserServices } from "./services/services.ts";
import { MockRepository } from "./repositories/mock.repository.ts";

const user: Schemas.User = {
  code: "WOW!Code",
  email: "test@test.com",
  password: "SUPER_SECRET_PASSWORD",
  roles: ["user"],
  verify_email: false,
  id: v4(),
};

async function Migrate(target: Repository, source: Repository) {
  const source_users = await source.findAll();
  for (const user of source_users) {
    try {
      await target.findById(user.id);
      await target.updateWithId(user.id, user);
    } catch (e) {
      await target.insertOne(user);
    }
  }
}

async function Main() {
  const surreal = await SurrealRepository.getInstance();
  const mongo = await MongoRepository.getInstance();
  const mock = await MockRepository.getInstance();

  let service: UserServices;
  let sign: boolean;
  try {
    service = new UserServices(surreal);
    await service.create(user);

    sign = await service.signUser({
      email: user.email,
      password: user.password + "Just_A_Test!",
    });
    console.log(sign ? "Signed!" : "Not signed! :(");

    service = new UserServices(mongo);
    await service.create(user);

    sign = await service.signUser({
      email: user.email,
      password: user.password,
    });
    console.log(sign ? "Signed!" : "Not signed! :(");

    service = new UserServices(mock);
    await service.create(user);

    sign = await service.signUser({
      email: user.email,
      password: user.password,
    });
    console.log(sign ? "Signed!" : "Not signed! :(");

    await Migrate(mock, surreal);
  } catch (e) {
    console.error(e);
  } finally {
    await surreal.closeConnection();
    await mongo.closeConnection();
  }
}

Main();
