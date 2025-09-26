import serverlessExpress from "@vendia/serverless-express";
import app from "./app.js";

// Fix for serverless event emitter issues
if (typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined') {
  process.stdout._handle = process.stderr._handle = null;
}

export const lambdaHandler = serverlessExpress({ app });
