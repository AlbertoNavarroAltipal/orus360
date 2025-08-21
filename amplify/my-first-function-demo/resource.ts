import { defineFunction } from '@aws-amplify/backend'

export const myFirstFunction = defineFunction({
  name: 'my-first-function-demo',
  entry: './handler.ts'
})
