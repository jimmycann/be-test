import { APIGatewayProxyEvent } from "aws-lambda";
import * as payments from "../src/lib/payments";
import { handler } from "../src/listPayments";

describe("listPayments", () => {
  const testCases = [
    {
      name: "successfully lists all payments",
      input: {},
      mockFn: () =>
        jest
          .spyOn(payments, "listPayments")
          .mockResolvedValueOnce([{ id: "1", currency: "USD", amount: 100 }]),
      expectedStatusCode: 200,
      expectedResponse: { data: [{ id: "1", currency: "USD", amount: 100 }] },
    },
    {
      name: "successfully lists payments for specific currency",
      input: { currency: "USD" },
      mockFn: () =>
        jest
          .spyOn(payments, "listPayments")
          .mockResolvedValueOnce([{ id: "1", currency: "USD", amount: 100 }]),
      expectedStatusCode: 200,
      expectedResponse: { data: [{ id: "1", currency: "USD", amount: 100 }] },
    },
    {
      name: "returns 422 for an invalid currency",
      input: { currency: "INVALID_CURRENCY" },
      mockFn: () => jest.spyOn(payments, "listPayments"),
      expectedStatusCode: 422,
      expectedResponse: {
        message: "Invalid input supplied",
        errors: [
          "currency: Invalid enum value. Expected 'SGD' | 'JPY' | 'USD' | 'EUR' | 'AUD', received 'INVALID_CURRENCY'",
        ],
      },
    },
    {
      name: "returns 500 on list payments error",
      input: {},
      mockFn: () =>
        jest
          .spyOn(payments, "listPayments")
          .mockRejectedValueOnce(new Error("Unexpected error")),
      expectedStatusCode: 500,
      expectedResponse: { message: "Internal Server Error" },
    },
  ];

  testCases.forEach((testCase) => {
    it(testCase.name, async () => {
      testCase.mockFn();

      const result = await handler({
        queryStringParameters: testCase.input,
      } as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(testCase.expectedStatusCode);
      expect(JSON.parse(result.body)).toEqual(testCase.expectedResponse);
    });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});
