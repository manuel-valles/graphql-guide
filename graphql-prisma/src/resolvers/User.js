const User = {
  posts: async (parent, args, { prisma }, info) =>
    await prisma.post.findMany({ where: { authorId: parent.id } }),
  comments: async (parent, args, { prisma }, info) =>
    await prisma.comment.findMany({ where: { authorId: parent.id } }),
};

export { User as default };
