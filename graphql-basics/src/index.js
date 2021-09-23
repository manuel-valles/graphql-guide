import { GraphQLServer } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid';
import db from './db';

const isMatch = (query, elementToMatch) =>
  elementToMatch.toLocaleLowerCase().includes(query.toLocaleLowerCase());

// Resolvers
const resolvers = {
  Query: {
    greeting: (parent, args, ctx, info) =>
      `Hello${args.name ? `, ${args.name}` : '!'}`,
    add: (parent, { numbers }, ctx, info) => numbers.reduce((a, b) => a + b, 0),
    grades: (parent, args, ctx, info) => [99, 88],
    users: (parent, { query }, { db }, info) =>
      query ? db.users.filter((user) => isMatch(query, user.name)) : db.users,
    posts: (parent, { query }, { db }, info) =>
      query
        ? db.posts.filter(
            (post) => isMatch(query, post.title) || isMatch(query, post.body)
          )
        : db.posts,
    comments: (parent, args, { db }, info) => db.comments,
    me: () => ({
      id: '123',
      name: 'Manuel Valles',
      email: 'manukempo@gmail.com',
      age: null,
    }),
  },
  Mutation: {
    createUser: (parent, { data }, { db }, info) => {
      const emailTaken = db.publishedusers.some(
        (user) => user.email === data.email
      );
      if (emailTaken) throw new Error('Email taken');

      const user = {
        id: uuidv4(),
        ...data,
      };

      db.users.push(user);

      return user;
    },
    deleteUser: (parent, args, { db }, info) => {
      const userIndex = db.users.findIndex((user) => user.id === args.id);

      if (userIndex === -1) throw new Error('User not found');

      const deletedUsers = db.users.splice(userIndex, 1);

      db.posts = db.posts.filter((post) => {
        const match = post.author === args.id;

        if (match) {
          db.comments = db.comments.filter(
            (comment) => comment.post !== post.id
          );
        }

        return !match;
      });

      db.comments = db.comments.filter((comment) => comment.author !== args.id);

      return deletedUsers[0];
    },
    createPost: (parent, { data }, { db }, info) => {
      const userExists = db.users.some((user) => user.id === data.author);

      if (!userExists) throw new Error('User not found');

      const post = {
        id: uuidv4(),
        ...data,
      };

      db.posts.push(post);

      return post;
    },
    deletePost: (parent, args, { db }, info) => {
      const postIndex = db.posts.findIndex((post) => post.id === args.id);

      if (postIndex === -1) throw new Error('Post not found');

      const deletedPosts = db.posts.splice(postIndex, 1);

      db.comments = db.comments.filter((comment) => comment.post !== args.id);

      return deletedPosts[0];
    },
    createComment: (parent, { data }, { db }, info) => {
      const userExists = db.users.some((user) => user.id === data.author);
      const postExists = db.posts.some(
        (post) => post.id === data.post && post.published
      );

      if (!userExists || !postExists)
        throw new Error('Unable to find user and post');

      const comment = {
        id: uuidv4(),
        ...data,
      };

      db.comments.push(comment);

      return comment;
    },
    deleteComment: (parent, args, { db }, info) => {
      const commentIndex = db.comments.findIndex(
        (comment) => comment.id === args.id
      );

      if (commentIndex === -1) throw new Error('Comment not found');

      const deletedComments = db.comments.splice(commentIndex, 1);

      return deletedComments[0];
    },
  },
  Post: {
    author: (parent, args, { db }, info) =>
      db.users.find((user) => user.id === parent.author),
    comments: (parent, args, { db }, info) =>
      db.comments.filter((comment) => comment.post === parent.id),
  },
  User: {
    posts: (parent, args, { db }, info) =>
      db.posts.filter((post) => post.author === parent.id),
    comments: (parent, args, { db }, info) =>
      db.comments.filter((comment) => comment.author === parent.id),
  },
  Comment: {
    author: (parent, args, { db }, info) =>
      db.users.find((user) => user.id === parent.author),
    post: (parent, args, ctx, info) =>
      db.posts.find((post) => post.id === parent.post),
  },
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: {
    db,
  },
});

server.start(() =>
  console.log('Server is up an running on http://localhost:4000')
);
