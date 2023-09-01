import Fastify, { FastifyInstance } from "fastify";

import FastifySwagger from "@fastify/swagger";
import SwaggerOptions = FastifySwagger.SwaggerOptions;
import FastifySwaggerUI from "@fastify/swagger-ui";
import SwaggerUIOptions = FastifySwaggerUI.FastifySwaggerUiOptions;

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { AppHdlrs } from "./app.hdlrs.ts";

export interface AppInstance extends FastifyInstance {}

export class AppBuilder {
  private static readonly SwaggerOptions: SwaggerOptions = {
    transform: jsonSchemaTransform,
  };
  private static readonly SwaggerUIOptions: SwaggerUIOptions = {
    routePrefix: "/docs",
  };

  private static async AddSwagger(fastify: FastifyInstance): Promise<void> {
    if (process.env["NODE_ENV"] !== "production") {
      await fastify.register(FastifySwagger, this.SwaggerOptions);
      await fastify.register(FastifySwaggerUI, this.SwaggerUIOptions);
    }
  }

  public static async BuildApp(): Promise<AppInstance> {
    const fastify: FastifyInstance = Fastify({ logger: false });

    fastify.setNotFoundHandler(AppHdlrs.NotFoundHdlr);

    await this.AddSwagger(fastify);

    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    return fastify as AppInstance;
  }
}
