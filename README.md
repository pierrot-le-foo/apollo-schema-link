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

const schema = gql`
  type Query {
    isLoggedIn: Boolean!
  }

  type Mutation {
    login: Boolean
    logout: Boolean
  }
`;

const isLoggedIn = gql`
  query isLoggedIn {
    isLoggedIn
  }
`;

const login = gql`
  mutation login {
    login
  }
`;

const logout = gql`
  mutation logout {
    logout
  }
`;

const resolvers = {
  isLoggedIn() {
    return cache.readQuery({
      query: isLoggedIn,
    }) || false;
  },

  login() {
    cache.writeQuery({
      query: isLoggedIn,
      data: { isLoggedIn: true },
    });
  },

  logout() {
    cache.writeQuery({
      query: isLoggedIn,
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
