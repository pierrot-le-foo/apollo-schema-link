"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@apollo/client");
const graphql_1 = require("graphql");
function invariant(condition, errorMessage) {
    if (!condition) {
        throw new Error(errorMessage);
    }
}
function checkDocument(doc) {
    invariant(doc && doc.kind === "Document", 'Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a "gql" tag? http://docs.apollostack.com/apollo-client/core.html#gql');
    var operations = doc.definitions
        .filter(function (d) {
        return d.kind !== "FragmentDefinition";
    })
        .map(function (definition) {
        if (definition.kind !== "OperationDefinition") {
            throw new Error('Schema type definitions not allowed in queries. Found: "' +
                definition.kind +
                '"');
        }
        return definition;
    });
    invariant(operations.length <= 1, "Ambiguous GraphQL document: contains " + operations.length + " operations");
    return doc;
}
function getMainDefinition(queryDoc) {
    checkDocument(queryDoc);
    var fragmentDefinition;
    for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
        var definition = _a[_i];
        if (definition.kind === "OperationDefinition") {
            var operation = definition.operation;
            if (operation === "query" ||
                operation === "mutation" ||
                operation === "subscription") {
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
    throw new Error("Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.");
}
const isSubscription = (query) => {
    const main = getMainDefinition(query);
    return (main.kind === "OperationDefinition" && main.operation === "subscription");
};
class SchemaLink extends client_1.ApolloLink {
    constructor({ schema, rootValue, context, typeResolver, }) {
        super();
        this.schema = schema;
        this.rootValue = rootValue;
        this.context = context;
        this.typeResolver = typeResolver;
    }
    request(operation) {
        return new client_1.Observable((observer) => __awaiter(this, void 0, void 0, function* () {
            try {
                const executor = isSubscription(operation.query)
                    ? graphql_1.subscribe
                    : graphql_1.execute;
                const context = typeof this.context === "function"
                    ? this.context(operation)
                    : this.context;
                const result = yield executor({
                    schema: this.schema,
                    document: operation.query,
                    rootValue: this.rootValue,
                    context,
                    variableValues: operation.variables,
                    name: operation.operationName,
                    typeResolver: this.typeResolver,
                });
                if (result.errors) {
                    yield observer.error(result.errors[0]);
                }
                else {
                    if (Array.isArray(result)) {
                        for (const r of result) {
                            yield observer.next(r);
                        }
                    }
                    else {
                        yield observer.next(result);
                    }
                    yield observer.complete();
                }
            }
            catch (error) {
                observer.error(error);
            }
        }));
    }
}
exports.default = SchemaLink;
