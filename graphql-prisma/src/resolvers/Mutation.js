import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import getUserId from '../utils/getUserId';

const Mutation = {
  createUser: async (parent, { data }, { prisma }) => {
    const emailTaken = await prisma.user.count({
      where: { email: data.email },
    });

    if (emailTaken) throw new Error('Email taken');

    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password,
      },
    });

    return {
      user,
      token: sign({ userId: user.id }, process.env.JWT_SECRET),
    };
  },

  login: async (parent, { data: { email, password } }, { prisma }) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) throw new Error('Invalid credentials');

    return {
      user,
      token: sign({ userId: user.id }, process.env.JWT_SECRET),
    };
  },

  updateUser: async (parent, { data }, { prisma, request }) => {
    const userId = getUserId(request);

    if (data.email) {
      const emailTaken = await prisma.user.count({
        where: { email: data.email },
      });

      if (emailTaken) throw new Error('Email taken');
    }

    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  deleteUser: async (parent, args, { prisma, request }) => {
    const userId = getUserId(request);
    return await prisma.user.delete({ where: { id: userId } });
  },

  createPost: async (parent, { data }, { prisma, pubsub, request }) => {
    const userId = getUserId(request);

    const post = await prisma.post.create({
      data: {
        ...data,
        author: {
          connect: {
            id: userId,
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
  updatePost: async (parent, { id, data }, { prisma, pubsub, request }) => {
    const userId = getUserId(request);
    const [originalPost] = await prisma.post.findMany({
      where: {
        AND: [{ id }, { author: { id: userId } }],
      },
    });

    if (!originalPost) throw new Error('Unable to update post');

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
  deletePost: async (parent, { id }, { prisma, pubsub, request }) => {
    const userId = getUserId(request);
    const postExists = await prisma.post.count({
      where: { id, author: { id: userId } },
    });

    if (!postExists) throw new Error('Unable to delete post');

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
  createComment: async (parent, { data }, { prisma, pubsub, request }) => {
    const userId = getUserId(request);
    const postExists = await prisma.post.count({ where: { id: data.post } });

    if (!postExists) throw new Error('Unable to find post');

    const comment = await prisma.comment.create({
      data: {
        ...data,
        author: {
          connect: {
            id: userId,
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
  updateComment: async (parent, { id, data }, { prisma, pubsub, request }) => {
    const userId = getUserId(request);
    const [originalComment] = await prisma.comment.findMany({
      where: {
        AND: [{ id }, { author: { id: userId } }],
      },
    });

    if (!originalComment) throw new Error('Unable to update post');

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
  deleteComment: async (parent, { id }, { prisma, pubsub, request }) => {
    const userId = getUserId(request);
    const commentExists = await prisma.comment.count({
      where: { id, author: { id: userId } },
    });

    if (!commentExists) throw new Error('Unable to delete comment');

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
