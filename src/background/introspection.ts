import { GraphQLError, ValidationContext } from "graphql";

export const NoIntrospection = (context: ValidationContext) => {
  return {
    Field(node) {
      if (node.name.value === "__schema" || node.name.value === "__type") {
        context.reportError(
          new GraphQLError("Introspection is disabled", [node])
        );
      }
    },
  };
};
