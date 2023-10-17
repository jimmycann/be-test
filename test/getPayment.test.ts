import { APIGatewayProxyEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import * as payments from "../src/lib/payments";
import { handler } from "../src/getPayment";

describe("getPayment", () => {
  const testCases = [
    {
      name: "successfully returns a payment",
      setupMock: (paymentId: string) => {
        const mockPayment = {
          id: paymentId,
          currency: "AUD",
          amount: 2000,
        };
        jest.spyOn(payments, "getPayment").mockResolvedValueOnce(mockPayment);
        return {
          event: {
            pathParameters: { id: paymentId },
          },
          expectedStatusCode: 200,
          expectedBody: mockPayment,
        };
      },
    },
    {
      name: "returns 400 if the paymentId is not provided",
      setupMock: () => {
        jest.spyOn(payments, "getPayment");
        return {
          event: {
            pathParameters: {},
          },
          expectedStatusCode: 400,
          expectedBody: { message: "Payment ID not provided" },
        };
      },
    },
    {
      name: "returns 404 if the payment is not found",
      setupMock: (paymentId: string) => {
        jest.spyOn(payments, "getPayment").mockResolvedValueOnce(null);
        return {
          event: {
            pathParameters: { id: paymentId },
          },
          expectedStatusCode: 404,
          expectedBody: { message: "Payment ID not found" },
        };
      },
    },
    {
      name: "returns 500 if getPayment call fails",
      setupMock: (paymentId: string) => {
        jest
          .spyOn(payments, "getPayment")
          .mockRejectedValueOnce(new Error("Internal error"));
        return {
          event: {
            pathParameters: { id: paymentId },
          },
          expectedStatusCode: 500,
          expectedBody: { message: "Internal Server Error" },
        };
      },
    },
  ];

  testCases.forEach((testCase) => {
    it(testCase.name, async () => {
      const paymentId = randomUUID();
      const { event, expectedStatusCode, expectedBody } =
        testCase.setupMock(paymentId);

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(expectedStatusCode);
      expect(JSON.parse(result.body)).toEqual(expectedBody);
    });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});
