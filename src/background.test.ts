import gql from "graphql-tag";
import { FinchApi } from "./background";
import { FinchMessageKey, FinchMessageSource } from "./types";

describe("FinchApi", () => {
  it("should build up and schema based on typeDefs and resolvers", () => {
    const api = new FinchApi({
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
    const api = new FinchApi({
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
      type: FinchMessageKey.Generic,
    });
    expect(resolverMethod).toHaveBeenCalled();
    expect(resolverMethod.mock.calls[0][2]).toEqual({
      source: FinchMessageSource.Message,
      sender: undefined,
    });
  });

  it("should pass along the context of an external message when using the external message handler", async () => {
    const resolverMethod = jest.fn().mockResolvedValue(true);
    const api = new FinchApi({
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
      type: FinchMessageKey.Generic,
    });
    expect(resolverMethod).toHaveBeenCalled();
    expect(resolverMethod.mock.calls[0][2]).toEqual({
      source: FinchMessageSource.ExternalMessage,
      sender: undefined,
    });
  });

  it("should support passing a document instead of a string", () => {
    const api = new FinchApi({
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

  it("should allow for a custom message key", async () => {
    const api = new FinchApi({
      typeDefs: `type Query { test: Boolean! }`,
      resolvers: {
        Query: {
          test: () => true,
        },
      },
      messageKey: "Custom",
    });

    const respBad = await api.onExternalMessage({
      query: gql`
        query getTest {
          test
        }
      `,
      variables: {},
      type: FinchMessageKey.Generic,
    });

    expect(respBad).toBeFalsy();

    const respGood = await api.onExternalMessage({
      query: gql`
        query getTest {
          test
        }
      `,
      variables: {},
      type: "Custom",
    });

    expect(respGood).toEqual({
      data: { test: true },
    });
  });
});
