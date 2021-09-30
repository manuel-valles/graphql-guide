import { v4 as uuidv4 } from 'uuid';

const Mutation = {
  createUser: async (parent, { data }, { prisma }, info) => {
    const emailTaken = await prisma.user.count({
      where: { email: data.email },
    });

    if (emailTaken) throw new Error('Email taken');

    return await prisma.user.create({ data });
  },

  updateUser: async (parent, { id, data }, { prisma }, info) => {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) throw new Error('User not found');

    if (data.email) {
      const emailTaken = await prisma.user.count({
        where: { email: data.email },
      });

      if (emailTaken) throw new Error('Email taken');
    }

    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  deleteUser: async (parent, { id }, { prisma }, info) => {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) throw new Error('User not found');

    return await prisma.user.delete({ where: { id } });
  },

  createPost: async (parent, { data }, { prisma, pubsub }, info) => {
    const userExists = await prisma.user.findUnique({
      where: { id: data.author },
    });

    if (!userExists) throw new Error('User not found');

    const post = await prisma.post.create({
      data: {
        ...data,
        author: {
          connect: {
            id: data.author,
          },
        },
      },
    });

    if (data.published)
      pubsub.publish('post', {
        post: {
          mutation: 'CREATED',
          data: post,
        },
      });

    return post;
  },
  updatePost: async (parent, { id, data }, { prisma, pubsub }, info) => {
    const originalPost = await prisma.post.findUnique({ where: { id } });

    if (!originalPost) throw new Error('Post not found');

    const updatedPost = await prisma.post.update({ where: { id }, data });

    if (typeof data.published === 'boolean') {
      if (originalPost.published && !updatedPost.published) {
        // deleted
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: originalPost,
          },
        });
      } else if (!originalPost.published && updatedPost.published) {
        // published/created
        pubsub.publish('post', {
          post: {
            mutation: 'CREATED',
            data: updatedPost,
          },
        });
      }
    } else if (updatedPost.published) {
      // updated
      pubsub.publish('post', {
        post: {
          mutation: 'UPDATED',
          data: updatedPost,
        },
      });
    }

    return updatedPost;
  },
  deletePost: async (parent, { id }, { prisma, pubsub }, info) => {
    const postExists = await prisma.post.count({ where: { id } });

    if (!postExists) throw new Error('Post not found');

    const post = await prisma.post.delete({ where: { id } });

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
