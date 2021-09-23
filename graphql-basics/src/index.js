import { GraphQLServer } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid';

// Mock data
let users = [
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

let posts = [
  {
    id: '1',
    title: 'GraphQL 001',
    body: 'This is how to use GraphQL.',
    published: true,
    author: '1',
  },
  {
    id: '2',
    title: 'GraphQL 002',
    body: 'This is about advanced GraphQL.',
    published: false,
    author: '1',
  },
  {
    id: '3',
    title: 'Programming Music',
    body: '',
    published: false,
    author: '2',
  },
];

let comments = [
  {
    id: '1',
    text: 'Comment 001',
    author: '1',
    post: '1',
  },
  {
    id: '2',
    text: 'Comment 002',
    author: '1',
    post: '2',
  },
  {
    id: '3',
    text: 'Comment 003',
    author: '2',
    post: '1',
  },
  {
    id: '4',
    text: 'Comment 004',
    author: '2',
    post: '2',
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
        comments: [Comment!]!
        me: User!
    }

    type Mutation {
      createUser(data: CreateUserInput!): User!
      deleteUser(id: ID!): User!
      createPost(data: CreatePostInput!): Post!
      deletePost(id: ID!): Post!
      createComment(data: CreateCommentInput!): Comment!
      deleteComment(id: ID!): Comment!
    }

    input CreateUserInput {
      name: String!
      email: String!
      age: Int
    }

    input CreatePostInput {
      title: String!
      body: String!
      published: Boolean!
      author: ID!
    }

    input CreateCommentInput {
      text: String!
      author: ID!
      post: ID!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
      id: ID!
      title: String!
      body: String!
      published: Boolean!
      author: User!
      comments: [Comment!]!
    }

    type Comment {
      id: ID!
      text: String!
      author: User!
      post: Post!
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
    comments: (parent, args, ctx, info) => comments,
    me: () => ({
      id: '123',
      name: 'Manuel Valles',
      email: 'manukempo@gmail.com',
      age: null,
    }),
  },
  Mutation: {
    createUser: (parent, { data }, ctx, info) => {
      const emailTaken = users.some((user) => user.email === data.email);
      if (emailTaken) throw new Error('Email taken');

      const user = {
        id: uuidv4(),
        ...data,
      };

      users.push(user);

      return user;
    },
    deleteUser: (parent, args, ctx, info) => {
      const userIndex = users.findIndex((user) => user.id === args.id);

      if (userIndex === -1) throw new Error('User not found');

      const deletedUsers = users.splice(userIndex, 1);

      posts = posts.filter((post) => {
        const match = post.author === args.id;

        if (match) {
          comments = comments.filter((comment) => comment.post !== post.id);
        }

        return !match;
      });

      comments = comments.filter((comment) => comment.author !== args.id);

      return deletedUsers[0];
    },
    createPost: (parent, { data }, ctx, info) => {
      const userExists = users.some((user) => user.id === data.author);

      if (!userExists) throw new Error('User not found');

      const post = {
        id: uuidv4(),
        ...data,
      };

      posts.push(post);

      return post;
    },
    deletePost: (parent, args, ctx, info) => {
      const postIndex = posts.findIndex((post) => post.id === args.id);

      if (postIndex === -1) throw new Error('Post not found');

      const deletedPosts = posts.splice(postIndex, 1);

      comments = comments.filter((comment) => comment.post !== args.id);

      return deletedPosts[0];
    },
    createComment: (parent, { data }, ctx, info) => {
      const userExists = users.some((user) => user.id === data.author);
      const postExists = posts.some(
        (post) => post.id === data.post && post.published
      );

      if (!userExists || !postExists)
        throw new Error('Unable to find user and post');

      const comment = {
        id: uuidv4(),
        ...data,
      };

      comments.push(comment);

      return comment;
    },
    deleteComment: (parent, args, ctx, info) => {
      const commentIndex = comments.findIndex(
        (comment) => comment.id === args.id
      );

      if (commentIndex === -1) throw new Error('Comment not found');

      const deletedComments = comments.splice(commentIndex, 1);

      return deletedComments[0];
    },
  },
  Post: {
    author: (parent, args, ctx, info) =>
      users.find((user) => user.id === parent.author),
    comments: (parent, args, ctx, info) =>
      comments.filter((comment) => comment.post === parent.id),
  },
  User: {
    posts: (parent, args, ctx, info) =>
      posts.filter((post) => post.author === parent.id),
    comments: (parent, args, ctx, info) =>
      comments.filter((comment) => comment.author === parent.id),
  },
  Comment: {
    author: (parent, args, ctx, info) =>
      users.find((user) => user.id === parent.author),
    post: (parent, args, ctx, info) =>
      posts.find((post) => post.id === parent.post),
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });

server.start(() =>
  console.log('Server is up an running on http://localhost:4000')
);
