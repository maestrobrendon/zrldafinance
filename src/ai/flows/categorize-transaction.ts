'use server';

/**
 * @fileOverview AI-powered transaction categorization flow.
 *
 * categorizeTransaction - A function that categorizes a transaction description.
 * CategorizeTransactionInput - The input type for categorizeTransaction.
 * CategorizeTransactionOutput - The return type for categorizeTransaction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction to categorize.'),
  pastCategories: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      'Past transactions and their categories, to improve categorization accuracy.'
    ),
});
export type CategorizeTransactionInput = z.infer<
  typeof CategorizeTransactionInputSchema
>;

const CategorizeTransactionOutputSchema = z.object({
  category: z.string().describe('The predicted category of the transaction.'),
  confidence: z
    .number()
    .describe(
      'The confidence level (0-1) of the categorization, 1 being most confident.'
    )
    .optional(),
});
export type CategorizeTransactionOutput = z.infer<
  typeof CategorizeTransactionOutputSchema
>;

export async function categorizeTransaction(
  input: CategorizeTransactionInput
): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are a personal finance expert.  Your job is to categorize transactions into one of these categories: Groceries, Restaurants, Utilities, Rent, Mortgage, Transportation, Entertainment, Shopping, Travel, Income, Investments, or Other.

  You will receive a transaction description.  Based on the description, you will choose the best category.

  If you are unsure, choose "Other".

  Here are some past transactions and their categories which you can use as reference:
  {{#each pastCategories}}
  Transaction: {{key}}, Category: {{value}}
  {{/each}}

  Transaction Description: {{{transactionDescription}}}`,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
