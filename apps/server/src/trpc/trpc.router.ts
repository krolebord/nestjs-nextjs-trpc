import { INestApplication, Injectable, Type } from '@nestjs/common';
import { z } from 'zod';
import * as trpcExpress from '@trpc/server/adapters/express';
import { initTRPC } from '@trpc/server';
import { AppService } from '@server/app.service';
import { TempService } from '@server/temp/temp.service';

// Base trpc definition
type ExpressContextOpts = trpcExpress.CreateExpressContextOptions;
type ContextOpts = ExpressContextOpts & {
  app: INestApplication;
};
const createContext = ({ req, res, app }: ContextOpts) => ({
  app,
});

type Context = Awaited<ReturnType<typeof createContext>>;
const trpc = initTRPC.context<Context>().create();
const procedure = trpc.procedure;
const injectedProcedure = <TServices extends Record<string, Type<unknown>>>(
  services: TServices,
) => procedure.use(trpcInjection(services));

// Can be split into multiple files using `trpc.merge`

const appRouter = trpc.router({
  hello: injectedProcedure({
    hui: TempService,
  })
    .input(z.void())
    .query(({ ctx }) => {
      return ctx.hui.temp();
    }),
});

// Injection middleware
// Scare typedefs
type Middleware = Parameters<(typeof procedure)['use']>[0];
type TResolvedServices<TServices extends Record<string, Type<unknown>>> = {
  [K in keyof TServices]: InstanceType<TServices[K]>;
};
type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

const resolveServices = <TServices extends Record<string, Type<unknown>>>(
  app: INestApplication,
  services: TServices,
): Prettify<TResolvedServices<TServices>> => {
  const entries = Object.entries(services).map(
    ([key, type]) => [key, app.get(type)] as const,
  );
  return Object.fromEntries(entries) as Prettify<TResolvedServices<TServices>>;
};

function trpcInjection<TServices extends Record<string, Type<unknown>>>(
  serviceDef: TServices,
) {
  const injectionMiddleware = (async (opts) => {
    const services = resolveServices(opts.ctx.app, serviceDef);
    return opts.next({
      ctx: {
        ...services,
        userName: 'Tom',
      },
    });
  }) satisfies Middleware;
  return injectionMiddleware;
}

@Injectable()
export class TrpcRouter {
  async applyMiddleware(app: INestApplication) {
    app.use(
      `/trpc`,
      trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext: ({ req, res }: ExpressContextOpts) =>
          createContext({ req, res, app }),
      }),
    );
  }
}

export type AppRouter = typeof appRouter;
