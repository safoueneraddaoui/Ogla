import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common'
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphqlExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    GqlArgumentsHost.create(host)

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const response = exception.getResponse()
      const message =
        typeof response === 'string'
          ? response
          : (response as Record<string, unknown>).message ?? exception.message

      return new GraphQLError(Array.isArray(message) ? message.join(', ') : String(message), {
        extensions: { code: this.mapHttpCodeToGqlCode(status), status },
      })
    }

    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack)
    }

    return new GraphQLError('Internal server error', {
      extensions: { code: 'INTERNAL_SERVER_ERROR', status: 500 },
    })
  }

  private mapHttpCodeToGqlCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_USER_INPUT',
      401: 'UNAUTHENTICATED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      429: 'TOO_MANY_REQUESTS',
    }
    return map[status] ?? 'INTERNAL_SERVER_ERROR'
  }
}
