import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";
import { z } from "zod";

import { buildResponse, parseInput } from "./lib/apigateway";
import { createPayment, Payment } from "./lib/payments";
import { mapValidationErrors } from "./lib/validation";
import { currencyCodes } from "./lib/constants";

const schema = z.object({
  currency: z.enum(currencyCodes),
  amount: z.number().positive(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const paymentId = randomUUID();
    const paymentData = parseInput(event?.body || "{}") as Payment;
    const validationResult = schema.safeParse(paymentData);

    if (!validationResult.success) {
      return buildResponse(422, {
        message: "Invalid payment input supplied",
        errors: mapValidationErrors(validationResult?.error),
      });
    }

    await createPayment({
      ...paymentData,
      id: paymentId,
    });

    return buildResponse(201, { id: paymentId });
  } catch (error) {
    return buildResponse(500, { message: "Internal Server Error" });
  }
};
