import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

const Mutation = {
  createUser: async (parent, { data }, { prisma }, info) => {
    let user;

    try {
      user = await prisma.user.create({ data });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new Error('Email taken');
      }
      throw e;
    }

    return user;
  },

  updateUser: async (parent, { id, data }, { prisma }, info) =>
    await prisma.user.update({
      where: {
        id: +id,
      },
      data,
    }),

  deleteUser: async (parent, args, { prisma }, info) => {
    const userId = +args.id;

    await prisma.comment.deleteMany({
      where: {
        authorId: userId,
      },
    });

    await prisma.post.deleteMany({
      where: {
        authorId: userId,
      },
    });

    return await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  },

  createPost: (parent, { data }, { db, pubsub }, info) => {
    const userExists = db.users.some((user) => user.id === data.author);

    if (!userExists) throw new Error('User not found');

    const post = {
      id: uuidv4(),
      ...data,
    };

    db.posts.push(post);

    if (data.published)
      pubsub.publish('post', {
        post: {
          mutation: 'CREATED',
          data: post,
        },
      });

    return post;
  },
  updatePost: (parent, { id, data }, { db, pubsub }, info) => {
    const post = db.posts.find((post) => post.id === id);
    const originalPost = { ...post };

    if (!post) throw new Error('Post not found');

    if (typeof data.title === 'string') post.title = data.title;

    if (typeof data.body === 'string') post.body = data.body;

    if (typeof data.published === 'boolean') {
      post.published = data.published;

      if (originalPost.published && !post.published) {
        // deleted
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: originalPost,
          },
        });
      } else if (!originalPost.published && post.published) {
        // published/created
        pubsub.publish('post', {
          post: {
            mutation: 'CREATED',
            data: post,
          },
        });
      }
    } else if (post.published) {
      // updated
      pubsub.publish('post', {
        post: {
          mutation: 'UPDATED',
          data: post,
        },
      });
    }

    return post;
  },
  deletePost: (parent, args, { db, pubsub }, info) => {
    const postIndex = db.posts.findIndex((post) => post.id === args.id);

    if (postIndex === -1) throw new Error('Post not found');

    const [post] = db.posts.splice(postIndex, 1);

    db.comments = db.comments.filter((comment) => comment.post !== args.id);

    if (post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'DELETED',
          data: post,
        },
      });
    }

    return post;
  },
  createComment: (parent, { data }, { db, pubsub }, info) => {
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
    pubsub.publish(`comment ${data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment,
      },
    });

    return comment;
  },
  updateComment: (parent, { id, data }, { db, pubsub }, info) => {
    const comment = db.comments.find((comment) => comment.id === id);

    if (!comment) throw new Error('Comment not found');

    if (typeof data.text === 'string') {
      comment.text = data.text;
      pubsub.publish(`comment ${comment.post}`, {
        comment: {
          mutation: 'UPDATED',
          data: comment,
        },
      });
    }

    return comment;
  },
  deleteComment: (parent, args, { db, pubsub }, info) => {
    const commentIndex = db.comments.findIndex(
      (comment) => comment.id === args.id
    );

    if (commentIndex === -1) throw new Error('Comment not found');

    const [deletedComment] = db.comments.splice(commentIndex, 1);

    pubsub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment,
      },
    });

    return deletedComment;
  },
};

export { Mutation as default };
