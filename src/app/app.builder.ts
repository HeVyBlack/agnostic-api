import Fastify, { FastifyInstance } from "fastify";

import FastifySwagger, { SwaggerOptions } from "@fastify/swagger";
import FastifySwaggerUI, { FastifySwaggerUiOptions } from "@fastify/swagger-ui";

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { AppHdlrs } from "./app.hdlrs.ts";

import { Utils } from "@Utils";
import Env = Utils.Env;

import { Modules } from "@Modules";
import Modulator = Modules.Modulator;

export namespace AppBuilder {
  export interface AppInstance extends FastifyInstance {}

  export class AppBuilder {
    public constructor(private readonly modulator: Modulator) {}

    private readonly SwaggerOptions: SwaggerOptions = {
      transform: jsonSchemaTransform,
    };

    private readonly SwaggerUIOptions: FastifySwaggerUiOptions = {
      routePrefix: "/docs",
    };

    public async AddSwagger(fastify: FastifyInstance): Promise<void> {
      if (Env["NODE_ENV"] !== "production") {
        await fastify.register(FastifySwagger, this.SwaggerOptions);
        await fastify.register(FastifySwaggerUI, this.SwaggerUIOptions);
      }
    }

    public async BuildApp(): Promise<AppInstance> {
      const fastify: FastifyInstance = Fastify({ logger: false });

      fastify.setNotFoundHandler(AppHdlrs.NotFoundHdlr);

      await this.AddSwagger(fastify);

      fastify.setValidatorCompiler(validatorCompiler);
      fastify.setSerializerCompiler(serializerCompiler);

      await fastify.register(this.modulator.Plugin, { prefix: "/api" });

      return fastify as AppInstance;
    }
  }
}
