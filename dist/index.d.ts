import { ApolloLink, FetchResult, Observable, Operation } from "@apollo/client";
import { GraphQLSchema } from "graphql";
export declare namespace SchemaLink {
    type ResolverContextFunction = (operation: Operation) => Record<string, any>;
    interface Options {
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
    schema: GraphQLSchema;
    rootValue: any;
    context: SchemaLink.ResolverContextFunction | any;
    typeResolver: Record<string, any>;
    constructor({ schema, rootValue, context, typeResolver, }: SchemaLink.Options);
    request(operation: Operation): Observable<FetchResult> | null;
}
//# sourceMappingURL=index.d.ts.map