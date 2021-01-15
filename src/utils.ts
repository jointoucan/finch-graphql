import { DocumentNode } from "graphql";

export const isDocumentNode = (
  query: string | DocumentNode
): query is DocumentNode => {
  return typeof query === "object";
};
