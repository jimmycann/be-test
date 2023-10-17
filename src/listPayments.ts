import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";

import { buildResponse } from "./lib/apigateway";
import { listPayments } from "./lib/payments";
import { mapValidationErrors } from "./lib/validation";
import { currencyCodes } from "./lib/constants";

const schema = z.object({
  currency: z.enum(currencyCodes).nullable().optional(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const currency = event?.queryStringParameters?.currency;
    const validationResult = schema.safeParse({ currency });

    if (!validationResult.success) {
      return buildResponse(422, {
        message: "Invalid input supplied",
        errors: mapValidationErrors(validationResult?.error),
      });
    }

    const payments = await listPayments(currency);
    return buildResponse(200, { data: payments });
  } catch (error) {
    return buildResponse(500, { message: "Internal Server Error" });
  }
};
