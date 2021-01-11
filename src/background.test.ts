import gql from "graphql-tag";
import { TanagerApi } from "./background";
import { TanagerMessageKey, TanagerMessageSource } from "./types";

describe("TanagerApi", () => {
  it("should build up and schema based on typeDefs and resolvers", () => {
    const api = new TanagerApi({
      typeDefs: `type Query { test: Boolean! }`,
      resolvers: {
        Query: {
          test: () => true,
        },
      },
    });

    expect(api.query("{ test }", {})).resolves.toEqual({
      data: { test: true },
    });
  });

  it("should pass along the context of a message when using the message handler", async () => {
    const resolverMethod = jest.fn().mockResolvedValue(true);
    const api = new TanagerApi({
      typeDefs: `type Query { test: Boolean! }`,
      resolvers: {
        Query: {
          test: resolverMethod,
        },
      },
    });
    await api.onMessage({
      query: gql`
        query getTest {
          test
        }
      `,
      variables: {},
      type: TanagerMessageKey.Generic,
    });
    expect(resolverMethod).toHaveBeenCalled();
    expect(resolverMethod.mock.calls[0][2]).toEqual({
      source: TanagerMessageSource.Message,
      sender: undefined,
    });
  });

  it("should pass along the context of an external message when using the external message handler", async () => {
    const resolverMethod = jest.fn().mockResolvedValue(true);
    const api = new TanagerApi({
      typeDefs: `type Query { test: Boolean! }`,
      resolvers: {
        Query: {
          test: resolverMethod,
        },
      },
    });
    await api.onExternalMessage({
      query: gql`
        query getTest {
          test
        }
      `,
      variables: {},
      type: TanagerMessageKey.Generic,
    });
    expect(resolverMethod).toHaveBeenCalled();
    expect(resolverMethod.mock.calls[0][2]).toEqual({
      source: TanagerMessageSource.ExternalMessage,
      sender: undefined,
    });
  });

  it("should support passing a document instead of a string", () => {
    const api = new TanagerApi({
      typeDefs: `type Query { test: Boolean! }`,
      resolvers: {
        Query: {
          test: () => true,
        },
      },
    });

    const doc = gql`
      query test {
        test
      }
    `;

    expect(api.query(doc, {})).resolves.toEqual({
      data: { test: true },
    });
  });
});
