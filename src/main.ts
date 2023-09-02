import "dotenv/config.js";
import { FastifyInstance } from "fastify";
import path from "node:path";
import url from "node:url";

import { App } from "@App";
import { Modules } from "@Modules";

import { Schemas } from "@Schemas";
import User = Schemas.User;
import Schema = Schemas.Schema;

import { Repositories } from "@Repository";
import Repository = Repositories.Repository;
import UserRepository = Repositories.Mongo;

import { Utils } from "@Utils";
import Env = Utils.Env;
import Log = Utils.Log;

export namespace Agnostic {
  export class Program {
    private static readonly sourceDirPath = url.fileURLToPath(import.meta.url);

    public static readonly sourceDir: string = path.dirname(this.sourceDirPath);

    public static readonly publicDir: string = path.resolve(this.sourceDir, "..", "public");

    public static readonly fontsDir: string = path.resolve(this.sourceDir, "..", "fonts");

    private static OnShutDown<T extends Schema>(app: App.Instance, repositories: Repository<T>[]) {
      const signals = ["SINGINT", "SIGTERM"] as const;

      for (const signal of signals) {
        process.on(signal, async function () {
          await app.close();

          for (const repo of repositories) {
            await repo.CloseConnection();
          }

          process.exit(0);
        });
      }
    }

    public static async Main(): Promise<void> {
      try {
        const userRepository: Repository<User> = await UserRepository.GetInstance<User>("users");

        const modulator = new Modules.Modulator(userRepository);

        const appBuilder = new App.Builder.AppBuilder(modulator);

        const app: FastifyInstance = await appBuilder.BuildApp();

        const port: number = parseInt(`${Env["PORT"]}`) || 3000;

        await app.listen({ port });
        Log.info(`Server on port ${port}`);

        this.OnShutDown(app, [userRepository]);
      } catch (e) {
        if (e instanceof Error) Log.error(e.message);

        Log.error("The program will not run due errors!");
      }
    }
  }
}

Agnostic.Program.Main();
