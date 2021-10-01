import getUserId from '../utils/getUserId';

const Query = {
  users: async (parent, { query }, { prisma }, info) => {
    const opArgs = query
      ? { where: { name: { contains: query, mode: 'insensitive' } } }
      : {};

    return await prisma.user.findMany(opArgs);
  },

  posts: async (parent, { query }, { prisma }) => {
    const opArgs = {
      where: {
        published: true,
      },
    };

    if (query) {
      opArgs.where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { body: { contains: query, mode: 'insensitive' } },
      ];
    }

    return await prisma.post.findMany(opArgs);
  },

  comments: async (parent, args, { prisma }) => await prisma.comment.findMany(),

  post: async (parent, { id }, { prisma, request }) => {
    const userId = getUserId(request, false);

    const [post] = await prisma.post.findMany({
      where: {
        id,
        OR: [{ published: true }, { author: { id: userId } }],
      },
    });

    if (!post) throw new Error('Post not found');

    return post;
  },

  me: async (parent, args, { prisma, request }) => {
    const userId = getUserId(request);

    return await prisma.user.findUnique({ where: { id: userId } });
  },

  myPosts: async (parent, { query }, { prisma, request }) => {
    const userId = getUserId(request);

    const opArgs = {
      where: {
        authorId: userId,
      },
    };

    if (query) {
      opArgs.where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { body: { contains: query, mode: 'insensitive' } },
      ];
    }

    return await prisma.post.findMany(opArgs);
  },
};

export { Query as default };
