Apollo link to use a in-memory graphql server.

# Get started

```bash
npm i pierrot-le-foo/apollo-schema-link
```

```javascript
// Our dependencies
import SchemaLink from "apollo-schema-link";
import { gql, ApolloClient, InMemoryCache } from "@apollo/client";
import { buildSchema, print } from "graphql";
```

```javascript
// The query cache
const cache = new InMemoryCache();
```

```javascript
// Let's imagine a very simple state:
const schema = gql`
```

```graphql
  type Query {
    """
    If true, user is logged in
    """
    isLoggedIn: Boolean!
  }

  type Mutation {
    """
    Log user in
    """
    login: Boolean

    """
    Log user out
    """
    logout: Boolean
  }
```

```javascript
`;
```

```javascript
// The GraphQL client operations
const operations = {
  isLoggedIn: gql`
    query {
      isLoggedIn
    }
  `,

  login: gql`
    mutation {
      login
    }
  `,

  logout: gql`
    mutation {
      logout
    }
  `,
};
```

```javascript
// Our resolvers
const resolvers = {
  isLoggedIn() {
    return (
      cache.readQuery({
        query: operations.isLoggedIn,
      }) || false
    );
  },

  login() {
    cache.writeQuery({
      query: operations.isLoggedIn,
      data: { isLoggedIn: true },
    });
  },

  logout() {
    cache.writeQuery({
      query: operations.isLoggedIn,
      data: { isLoggedIn: false },
    });
  },
};
```

```javascript
// Create a new Apollo client
const client = new ApolloClient({
  link: new SchemaLink({
    schema: buildSchema(print(schema)),
    rootValue: resolvers,
  }),
  cache,
});
```

```javascript
// Fire your queries

await client.query({ query: isLoggedIn }); // false

await client.mutate({ mutation: login });
await client.query({ query: isLoggedIn }); // true

await client.mutate({ mutation: logout });
await client.query({ query: isLoggedIn }); // false
```
