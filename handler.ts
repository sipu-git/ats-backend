import serverless from "serverless-http";
import type { APIGatewayProxyEventV2, Context } from "aws-lambda";
import type { Request } from "express";
import app, { initApp } from "./app";

const serverlessHandler = serverless(app, {
  request: (req: Request, event: APIGatewayProxyEventV2) => {
    const stage = event.requestContext?.stage;
    if (stage && event.rawPath.startsWith(`/${stage}`)) {
      req.url = event.rawPath.replace(`/${stage}`, "") || "/";
    }
  }
});

let dbReady = false;

export const lambdaHandler = async (
  event: APIGatewayProxyEventV2,
  context: Context
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!dbReady && !event.rawPath.endsWith("/health")) {
    try {
      await initApp();
      dbReady = true;
    } catch (err) {
      console.error("DB connection failed:", err);
    }
  }

  return serverlessHandler(event, context);
};
