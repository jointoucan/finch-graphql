/* eslint-disable no-underscore-dangle */
const { visit, concatAST } = require("graphql");
const {
  ClientSideBaseVisitor,
  DocumentMode,
  getConfigValue,
} = require("@graphql-codegen/visitor-plugin-common");
const { pascalCase } = require("pascal-case");
const autoBind = require("auto-bind");

class FinchVisitor extends ClientSideBaseVisitor {
  constructor(schema, fragments, rawConfig, documents) {
    super(schema, fragments, rawConfig, {
      documentMode: DocumentMode.graphQLTag,
      errorType: getConfigValue(rawConfig.errorType, "unknown"),
      exposeQueryKeys: getConfigValue(rawConfig.exposeQueryKeys, false),
    });
    this._externalImportPrefix = this.config.importOperationTypesFrom
      ? `${this.config.importOperationTypesFrom}.`
      : "";
    this._documents = documents;

    autoBind(this);
  }

  get imports() {
    return this._imports;
  }

  getImports() {
    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    return [
      ...baseImports,
      `import { useQuery, useMutation } from 'finch-graphql';`,
    ];
  }

  buildOperation(
    node,
    documentVariableName,
    operationType,
    operationResultType,
    operationVariablesTypes
  ) {
    const operationName = this.convertName(
      (node.name && node.name.value) || "",
      {
        suffix: pascalCase(operationType),
        useTypesPrefix: false,
      }
    );

    if (operationType === "Query") {
      return `export const use${operationName} = (config?: {
        variables?: ${operationVariablesTypes};
        skip?: Boolean;
      }) => use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, config);`;
    }
    if (operationType === "Mutation") {
      return `export const use${operationName} = () => use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName});`;
    }
    if (operationType === "Subscription") {
      // eslint-disable-next-line no-console
      console.warn(`Plugin for "finch-graphql" does not support subscriptions`);
    }

    return null;
  }
}

const plugin = (schema, documents, config) => {
  const allAst = concatAST(documents.map((v) => v.document));

  const allFragments = [];

  const visitor = new FinchVisitor(schema, allFragments, config, documents);
  const visitorResult = visit(allAst, { leave: visitor });

  return {
    prepend: [...visitor.getImports()],
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter((t) => typeof t === "string"),
    ].join("\n"),
  };
};

module.exports = {
  plugin,
};
