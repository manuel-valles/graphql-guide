import { v4 as uuidv4 } from 'uuid';

const Mutation = {
  createUser: (parent, { data }, { db }, info) => {
    const emailTaken = db.users.some((user) => user.email === data.email);
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
        db.comments = db.comments.filter((comment) => comment.post !== post.id);
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
};

export { Mutation as default };
