Apollo link to use a in-memory graphql server.

# Install

```bash
npm i pierrot-le-foo/apollo-schema-link
```

# Get started

## Simple example

```javascript
// Our dependencies
import SchemaLink from "apollo-schema-link";
import { gql, ApolloClient, InMemoryCache } from "@apollo/client";
import { buildSchema, print } from "graphql";

const schema = gql`
  type User {
    id: ID!
    email: String!
  }

  type Query {
    getUsers: [User!]!
  }
`;

const operations = {
  getUsers: gql`
    query {
      getUsers
    }
  `,
};

const resolvers = {
  async getUsers() {
    const response = await fetch("/api/users");
    return await response.json();
  },
};
```

## Simple example with React

```javascript
// Our dependencies
import { useQuery } from "@apollo/client/react";

function Users() {
  const {
    data: { getUsers: users = [] } = {},
    error,
    loading,
  } = useQuery(operations.getUsers);

  if (error) {
    return <h4>Error {error.message}</h4>;
  }

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <table>
      {users.map((user) => (
        <tr key={user.id}>
          <td>{user.email}</td>
        </tr>
      ))}
    </table>
  );
}
```
