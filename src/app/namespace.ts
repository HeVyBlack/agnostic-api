import { AppBuilder } from "./app.builder.ts";

export namespace App {
  export const Builder = AppBuilder;
  export type Instance = AppBuilder.AppInstance;
  export type FunctionRegister = (app: Instance) => Promise<void>;
}
