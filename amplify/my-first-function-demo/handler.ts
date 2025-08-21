// amplify/my-first-function/handler.ts
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message: 'Hello from my first function!',
      event
    })
  }
}
