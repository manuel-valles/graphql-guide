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
  createComment: async (parent, { data }, { prisma, pubsub }, info) => {
    const userExists = await prisma.user.findUnique({
      where: { id: data.author },
    });
    const postExists = await prisma.post.count({ where: { id: data.post } });

    if (!userExists || !postExists)
      throw new Error('Unable to find user and post');

    const comment = await prisma.comment.create({
      data: {
        ...data,
        author: {
          connect: {
            id: data.author,
          },
        },
        post: {
          connect: {
            id: data.post,
          },
        },
      },
    });

    pubsub.publish(`comment ${data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment,
      },
    });

    return comment;
  },
  updateComment: async (parent, { id, data }, { prisma, pubsub }, info) => {
    const originalComment = await prisma.comment.findUnique({ where: { id } });

    if (!originalComment) throw new Error('Comment not found');

    const updatedComment = await prisma.comment.update({ where: { id }, data });

    if (typeof data.text === 'string') {
      pubsub.publish(`comment ${originalComment.postId}`, {
        comment: {
          mutation: 'UPDATED',
          data: updatedComment,
        },
      });
    }

    return updatedComment;
  },
  deleteComment: async (parent, { id }, { prisma, pubsub }, info) => {
    const commentExists = await prisma.comment.count({ where: { id } });

    if (!commentExists) throw new Error('Comment not found');

    const deletedComment = await prisma.comment.delete({ where: { id } });

    pubsub.publish(`comment ${deletedComment.postId}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment,
      },
    });

    return deletedComment;
  },
};

export { Mutation as default };
