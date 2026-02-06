import serverless from "serverless-http";
import type { APIGatewayProxyEventV2, Context } from "aws-lambda";
import app from "./app";
import type { Request } from "express";

const serverlessHandler = serverless(app, {
  request: (req:Request, event: APIGatewayProxyEventV2) => {
    if (event.rawPath && event.requestContext?.stage) {
      const stagePrefix = `/${event.requestContext.stage}`;
      if (event.rawPath.startsWith(stagePrefix)) {
        req.url = event.rawPath.replace(stagePrefix, "") || "/";
      }
    }
  }
});

export const lambdaHandler = async (
  event: APIGatewayProxyEventV2,
  context: Context
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return serverlessHandler(event, context);
};
