import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getPayment } from "./lib/payments";
import { buildResponse } from "./lib/apigateway";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const paymentId = event?.pathParameters?.id;

    // If no payment ID is provided in the request, return a 400
    if (!paymentId) {
      return buildResponse(400, { message: "Payment ID not provided" });
    }

    const payment = await getPayment(paymentId);

    // If the payment with the given ID doesn't exist, return a 404
    if (!payment) {
      return buildResponse(404, { message: "Payment ID not found" });
    }

    return buildResponse(200, payment);
  } catch (error) {
    return buildResponse(500, { message: "Internal Server Error" });
  }
};
