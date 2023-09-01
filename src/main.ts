import "dotenv/config.js";
import { FastifyInstance } from "fastify";
import path from "node:path";
import url from "node:url";

import { App } from "@App";
import { Modules } from "@Modules";

import { Schemas } from "@Schemas";
import User = Schemas.User;

import { Repositories } from "@Repository";
import Repository = Repositories.Repository;
import UserRepository = Repositories.Surreal;

export namespace Agnostic {
  const sourceDirPath = url.fileURLToPath(import.meta.url);
  export const sourceDir: string = path.dirname(sourceDirPath);
  export const publicDir: string = path.resolve(sourceDir, "..", "public");
  export const fontsDir: string = path.resolve(sourceDir, "..", "fonts");

  export class Program {
    public static async Main(): Promise<void> {
      try {
        const app: FastifyInstance = await App.Builder.BuildApp();

        const userRepositoryUri = process.env["USER_URI"];

        if (!userRepositoryUri) throw new Error("Need a URI for users");

        const userRepository: Repository<User> =
          await UserRepository.GetInstance("users", userRepositoryUri);

        const modulator: App.FunctionRegister =
          Modules.Modulator(userRepository);
        await app.register(modulator, { prefix: "/api" });

        const port: number = parseInt(`${process.env["PORT"]}`) || 3000;

        await app.listen({ port });
        console.log(`Server on port ${port}`);
      } catch (e) {
        if (e instanceof Error) console.error(e.message);

        console.error("The program will not run due errors!");
      }
    }
  }
}

await Agnostic.Program.Main();
