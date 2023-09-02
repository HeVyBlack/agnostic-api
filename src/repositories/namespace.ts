import { RepositoriesRepository, RepositoryError } from "./repositories.ts";
import { MongoRepository } from "./mongo.repository.ts";
import { SurrealRepository } from "./surreal.repository.ts";

import { Schemas } from "@Schemas";
import Schema = Schemas.Schema;

export namespace Repositories {
  export type Repository<T extends Schema> = RepositoriesRepository<T>;

  export const Error = RepositoryError;

  export type Mongo<T extends Schema> = MongoRepository<T>;
  export const Mongo = MongoRepository;

  export type Surreal<T extends Schema> = SurrealRepository<T>;
  export const Surreal = SurrealRepository;
}
