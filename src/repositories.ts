import * as Schemas from "./schemas.ts";

type Basic = Schemas.Basic;

export interface Repository<TBasic extends Basic = Basic> {
  name: string;
  closeConnection(): Promise<void>;
  find(query: Partial<TBasic>): Promise<TBasic>;
  findAll(): Promise<TBasic[]>;
  findByUuid(uuid: string): Promise<TBasic>;
  updateWithUuid(uuid: string, up: Partial<TBasic>): Promise<TBasic>;
  insertOne(thing: TBasic): Promise<TBasic>;
  deleteByUuid(uuid: string): Promise<void>;
}

export * from "./repositories/mock.repository.ts";
export * from "./repositories/mongo.repository.ts";
export * from "./repositories/surreal.repository.ts";
