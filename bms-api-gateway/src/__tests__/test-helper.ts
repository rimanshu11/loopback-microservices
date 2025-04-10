import { Client, createRestAppClient } from '@loopback/testlab';
import { BmsApplication } from '../application';

export async function setupApplication(): Promise<{
  app: BmsApplication;
  client: Client;
}> {
  const app = new BmsApplication({
    rest: {
      port: 0,
    },
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return { app, client };
}
