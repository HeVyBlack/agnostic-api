import { AppBuilder, AppInstance } from "./app.builder.ts";

export namespace App {
  export const Builder = AppBuilder;
  export type Instance = AppInstance;
  export type FunctionRegister = (app: Instance) => Promise<void>;
}
