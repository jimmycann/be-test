import { APIGatewayProxyEvent } from "aws-lambda";
import * as payments from "../src/lib/payments";
import { handler } from "../src/createPayment";

describe("createPayment", () => {
  const testCases = [
    {
      name: "successfully creates a payment",
      input: JSON.stringify({ currency: "AUD", amount: 2000 }),
      mockFn: () =>
        jest.spyOn(payments, "createPayment").mockResolvedValueOnce(),
      expectedStatusCode: 201,
      expectedResponse: expect.objectContaining({
        id: expect.any(String), // generated UUID
      }),
    },
    {
      name: "returns 422 when using an invalid currency",
      input: JSON.stringify({ currency: "INVALID_CURRENCY", amount: 2000 }),
      mockFn: () => jest.spyOn(payments, "createPayment"),
      expectedStatusCode: 422,
      expectedResponse: expect.objectContaining({
        message: "Invalid payment input supplied",
        errors: [
          "currency: Invalid enum value. Expected 'SGD' | 'JPY' | 'USD' | 'EUR' | 'AUD', received 'INVALID_CURRENCY'",
        ],
      }),
    },
    {
      name: "returns 422 when using a negative amount",
      input: JSON.stringify({ currency: "AUD", amount: -2000 }),
      mockFn: () => jest.spyOn(payments, "createPayment"),
      expectedStatusCode: 422,
      expectedResponse: expect.objectContaining({
        message: "Invalid payment input supplied",
        errors: ["amount: Number must be greater than 0"],
      }),
    },
    {
      name: "returns 422 when currency not supplied",
      input: JSON.stringify({ amount: 2000 }),
      mockFn: () => jest.spyOn(payments, "createPayment"),
      expectedStatusCode: 422,
      expectedResponse: expect.objectContaining({
        message: "Invalid payment input supplied",
        errors: ["currency: Required"],
      }),
    },
    {
      name: "returns 422 when amount not supplied",
      input: JSON.stringify({ currency: "AUD" }),
      mockFn: () => jest.spyOn(payments, "createPayment"),
      expectedStatusCode: 422,
      expectedResponse: expect.objectContaining({
        message: "Invalid payment input supplied",
        errors: ["amount: Required"],
      }),
    },
    {
      name: "returns 500 on payment creation error",
      input: JSON.stringify({ currency: "AUD", amount: 2000 }),
      mockFn: () =>
        jest
          .spyOn(payments, "createPayment")
          .mockRejectedValueOnce(new Error("Database Error")),
      expectedStatusCode: 500,
      expectedResponse: { message: "Internal Server Error" },
    },
  ];

  testCases.forEach((testCase) => {
    it(testCase.name, async () => {
      testCase.mockFn();

      const result = await handler({
        body: testCase.input,
      } as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(testCase.expectedStatusCode);
      expect(JSON.parse(result.body)).toEqual(testCase.expectedResponse);
    });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});
