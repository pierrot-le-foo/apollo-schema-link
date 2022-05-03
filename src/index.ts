// @ts-ignore Peer dependency
import { ApolloLink, FetchResult, Observable, Operation } from "@apollo/client";

import {
  DocumentNode,
  execute,
  GraphQLSchema,
  subscribe,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  // @ts-ignore Peer dependency
} from "graphql";

function invariant(condition: boolean, errorMessage: string) {
  if (!condition) {
    throw new Error(errorMessage);
  }
}

function checkDocument(doc: DocumentNode) {
  invariant(
    doc && doc.kind === "Document",
    'Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a "gql" tag? http://docs.apollostack.com/apollo-client/core.html#gql'
  );
  var operations = doc.definitions
    .filter(function (d: FragmentDefinitionNode) {
      return d.kind !== "FragmentDefinition";
    })
    .map(function (definition: OperationDefinitionNode) {
      if (definition.kind !== "OperationDefinition") {
        throw new Error(
          'Schema type definitions not allowed in queries. Found: "' +
            definition.kind +
            '"'
        );
      }
      return definition;
    });
  invariant(
    operations.length <= 1,
    "Ambiguous GraphQL document: contains " + operations.length + " operations"
  );
  return doc;
}

function getMainDefinition(queryDoc: DocumentNode) {
  checkDocument(queryDoc);
  var fragmentDefinition;
  for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
    var definition = _a[_i];
    if (definition.kind === "OperationDefinition") {
      var operation = definition.operation;
      if (
        operation === "query" ||
        operation === "mutation" ||
        operation === "subscription"
      ) {
        return definition;
      }
    }
    if (definition.kind === "FragmentDefinition" && !fragmentDefinition) {
      fragmentDefinition = definition;
    }
  }
  if (fragmentDefinition) {
    return fragmentDefinition;
  }
  throw new Error(
    "Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment."
  );
}

const isSubscription = (query: DocumentNode) => {
  const main = getMainDefinition(query);
  return (
    main.kind === "OperationDefinition" && main.operation === "subscription"
  );
};

export declare namespace SchemaLink {
  export type ResolverContextFunction = (
    operation: Operation
  ) => Record<string, any>;

  export interface Options {
    /**
     * The schema to generate responses from.
     */
    schema: GraphQLSchema;

    /**
     * The root value to use when generating responses.
     */
    rootValue?: any;

    /**
     * A context to provide to resolvers declared within the schema.
     */
    context?: ResolverContextFunction | Record<string, any>;

    typeResolver?: Record<string, any>;
  }
}

export default class SchemaLink extends ApolloLink {
  public schema: GraphQLSchema;
  public rootValue: any;
  public context: SchemaLink.ResolverContextFunction | any;
  public typeResolver: Record<string, any>;

  constructor({
    schema,
    rootValue,
    context,
    typeResolver,
  }: SchemaLink.Options) {
    super();
    this.schema = schema;
    this.rootValue = rootValue;
    this.context = context;
    this.typeResolver = typeResolver as Record<string, any>;
  }

  public request(operation: Operation): Observable<FetchResult> | null {
    return new Observable<FetchResult>(async (observer: any) => {
      try {
        const executor: any = isSubscription(operation.query)
          ? subscribe
          : execute;

        const context =
          typeof this.context === "function"
            ? this.context(operation)
            : this.context;

        const result = await executor({
          schema: this.schema,
          document: operation.query,
          rootValue: this.rootValue,
          context,
          variableValues: operation.variables,
          name: operation.operationName,
          typeResolver: this.typeResolver,
        });

        if (result.errors) {
          await observer.error(result.errors[0]);
        } else {
          if (Array.isArray(result)) {
            for (const r of result) {
              await observer.next(
                r as FetchResult<
                  { [key: string]: any },
                  Record<string, any>,
                  Record<string, any>
                >
              );
            }
          } else {
            await observer.next(
              result as FetchResult<
                { [key: string]: any },
                Record<string, any>,
                Record<string, any>
              >
            );
          }

          await observer.complete();
        }
      } catch (error) {
        observer.error(error);
      }
    });
  }
}
