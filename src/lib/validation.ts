import { z } from "zod";

// This function take a zod error and returns an array of readble error strings
export const mapValidationErrors = (error: z.ZodError): string[] => {
  return error?.issues?.map((issue: z.ZodIssue) => {
    return `${issue?.path?.join(".")}: ${issue?.message}`;
  });
};
