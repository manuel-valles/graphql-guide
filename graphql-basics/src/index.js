import { GraphQLServer } from 'graphql-yoga';

// Scalar types (single values): ID, String, Int, Float, Boolean

// Demo users data
const users = [
  {
    id: '1',
    name: 'Manu',
    email: 'manu@gmail.com',
    age: 30,
  },
  {
    id: '2',
    name: 'Mar',
    email: 'mar@gmail.com',
  },
];

// Type definitions (schema)
const typeDefs = `
    type Query {
        greeting(name: String): String!
        add(numbers: [Int!]!): Float!
        grades: [Int!]!
        users(query: String): [User!]!
        me: User!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
    }
`;

// Resolvers
const resolvers = {
  Query: {
    greeting: (parent, args, ctx, info) =>
      `Hello${args.name ? `, ${args.name}` : '!'}`,
    add: (parent, { numbers }, ctx, info) => numbers.reduce((a, b) => a + b, 0),
    grades: (parent, args, ctx, info) => [99, 88],
    users: (parent, { query }, ctx, info) =>
      query
        ? users.filter((user) =>
            user.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
          )
        : users,
    me: () => ({
      id: '123',
      name: 'Manuel Valles',
      email: 'manukempo@gmail.com',
      age: null,
    }),
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });

server.start(() =>
  console.log('Server is up an running on http://localhost:4000')
);
