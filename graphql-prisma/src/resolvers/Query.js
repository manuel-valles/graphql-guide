const Query = {
  users: async (parent, { query }, { prisma }, info) =>
    (await query)
      ? prisma.user.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
        })
      : prisma.user.findMany(),
  posts: async (parent, { query }, { prisma }, info) =>
    (await query)
      ? prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { body: { contains: query, mode: 'insensitive' } },
            ],
          },
        })
      : prisma.post.findMany(),
  comments: async (parent, args, { prisma }, info) =>
    await prisma.comment.findMany(),
};

export { Query as default };
