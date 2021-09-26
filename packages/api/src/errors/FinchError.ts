import { GraphQLError } from 'graphql';

export class FinchError extends Error implements GraphQLError {
  public extensions: Record<string, any>;

  readonly name: GraphQLError['name'];

  readonly locations: GraphQLError['locations'];

  readonly path: GraphQLError['path'];

  readonly source: GraphQLError['source'];

  readonly positions: GraphQLError['positions'];

  readonly nodes: GraphQLError['nodes'];

  public originalError: GraphQLError['originalError'];

  [key: string]: any;

  constructor(
    message: string,
    code?: string,
    extensions?: Record<string, any>,
  ) {
    super(message);
    // @ts-ignore
    this.name = this.name ?? '';

    // This variable was previously named `properties`, which allowed users to set
    // arbitrary properties on the ApolloError object. This use case is still supported,
    // but deprecated in favor of using the ApolloError.extensions object instead.
    // This change intends to comply with the GraphQL spec on errors. See:
    // https://github.com/graphql/graphql-spec/blob/master/spec/Section%207%20--%20Response.md#response-format
    //
    // Going forward, users should use the ApolloError.extensions object for storing
    // and reading arbitrary data on an error, as arbitrary properties on the ApolloError
    // itself won't be supported in the future.
    //
    // XXX Filter 'message' and 'extensions' specifically so they don't overwrite the class property.
    // We _could_ filter all of the class properties, but have chosen to only do
    // so if it's an issue for other users. Please feel free to open an issue if you
    // find yourself here with this exact problem.
    if (extensions) {
      Object.keys(extensions)
        .filter(keyName => keyName !== 'message' && keyName !== 'extensions')
        .forEach(key => {
          this[key] = extensions[key];
        });
    }

    // if no name provided, use the default. defineProperty ensures that it stays non-enumerable
    if (!this.name) {
      Object.defineProperty(this, 'name', { value: 'FinchError' });
    }

    // Before the mentioned change to extensions, users could previously set the extensions
    // object by providing it as a key on the third argument to the constructor.
    // This step provides backwards compatibility for those hypothetical users.
    const userProvidedExtensions =
      (extensions && extensions.extensions) || null;

    this.extensions = { ...extensions, ...userProvidedExtensions, code };
  }
}

export function toFinchError(
  error: Error & { extensions?: Record<string, any> },
  code: string = 'INTERNAL_SERVER_ERROR',
): Error & { extensions: Record<string, any> } {
  const err = error;
  if (err.extensions) {
    err.extensions.code = code;
  } else {
    err.extensions = { code };
  }
  return err as Error & { extensions: Record<string, any> };
}
