import { GraphQLServer } from 'graphql-yoga';

// Mock data
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

const posts = [
  {
    id: '10',
    title: 'GraphQL 110',
    body: 'This is how to use GraphQL.',
    published: true,
    author: '1',
  },
  {
    id: '11',
    title: 'GraphQL 111',
    body: 'This is about advanced GraphQL.',
    published: false,
    author: '1',
  },
  {
    id: '12',
    title: 'Programming Music',
    body: '',
    published: false,
    author: '2',
  },
];

const isMatch = (query, elementToMatch) =>
  elementToMatch.toLocaleLowerCase().includes(query.toLocaleLowerCase());

// Type definitions (schema)
const typeDefs = `
    type Query {
        greeting(name: String): String!
        add(numbers: [Int!]!): Float!
        grades: [Int!]!
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
    }

    type Post {
      id: ID!
      title: String!
      body: String!
      published: Boolean!
      author: User!
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
      query ? users.filter((user) => isMatch(query, user.name)) : users,
    posts: (parent, { query }, ctx, info) =>
      query
        ? posts.filter(
            (post) => isMatch(query, post.title) || isMatch(query, post.body)
          )
        : posts,
    me: () => ({
      id: '123',
      name: 'Manuel Valles',
      email: 'manukempo@gmail.com',
      age: null,
    }),
  },
  Post: {
    author: (parent, args, ctx, info) =>
      users.find((user) => user.id === parent.author),
  },
  User: {
    posts: (parent, args, ctx, info) =>
      posts.filter((post) => post.author === parent.id),
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });

server.start(() =>
  console.log('Server is up an running on http://localhost:4000')
);
