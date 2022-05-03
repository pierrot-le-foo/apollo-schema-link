Apollo link to use a in-memory graphql server.

# Get started

```bash
npm i pierrot-le-foo/apollo-schema-link
```

```javascript
import SchemaLink from "apollo-schema-link";
import { gql, ApolloClient, InMemoryCache } from "@apollo/client";
import { buildSchema, print } from "graphql";

const cache = new InMemoryCache();

// Let'say imagine a very simple state with only a flag
// The flag is true or false and can be changed
const schema = gql`
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
`;

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

const client = new ApolloClient({
  link: new SchemaLink({
    schema: buildSchema(print(schema)),
    rootValue: resolvers,
  }),
  cache,
});

await client.query({ query: isLoggedIn }); // false

await client.mutate({ mutation: login });
await client.query({ query: isLoggedIn }); // true

await client.mutate({ mutation: logout });
await client.query({ query: isLoggedIn }); // false
```
