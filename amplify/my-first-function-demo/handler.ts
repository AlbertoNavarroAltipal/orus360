export const handler = async (event: unknown): Promise<string> => {
  return `Hello from my first function! ${JSON.stringify(event)}`;
};