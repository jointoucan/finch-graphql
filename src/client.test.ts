import { queryApi } from "./client";
import browser from "webextension-polyfill";
import gql from "graphql-tag";
import { TanagerMessageKey } from "./types";

describe("queryApi", () => {
  it("should send and message to the background script", async () => {
    browser.runtime.sendMessage = jest.fn();
    await queryApi(`{ test }`, {});
    expect(browser.runtime.sendMessage).toBeCalled();
  });
  it("should send and message to the background script externally", async () => {
    browser.runtime.sendMessage = jest.fn();
    const fooQuery = gql`
      query foo {
        test
      }
    `;
    await queryApi(fooQuery, {}, { id: "foo" });
    expect(browser.runtime.sendMessage).toBeCalledWith("foo", {
      type: TanagerMessageKey.Generic,
      query: fooQuery,
      variables: {},
    });
  });
});
