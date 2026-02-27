import { Scalar, type CustomScalar } from '@nestjs/graphql'
import { GraphQLJSON } from 'graphql-scalars'
import type { ValueNode } from 'graphql'

@Scalar('JSON')
export class JsonScalar implements CustomScalar<unknown, unknown> {
  description = 'JSON custom scalar — any valid JSON value'

  serialize(value: unknown): unknown {
    return GraphQLJSON.serialize(value)
  }

  parseValue(value: unknown): unknown {
    return GraphQLJSON.parseValue(value)
  }

  parseLiteral(ast: ValueNode): unknown {
    return GraphQLJSON.parseLiteral(ast, {})
  }
}
