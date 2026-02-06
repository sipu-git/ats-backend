import serverless from "serverless-http";
import app, { initApp } from "./app";

let handler: any;

export const lambdaHandler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await initApp();
  if (!handler) {
    handler = serverless(app);
  }
  return handler(event, context);
};
