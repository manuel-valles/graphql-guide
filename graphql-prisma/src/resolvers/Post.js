const Post = {
  author: async (parent, args, { prisma }, info) =>
    await prisma.user.findUnique({ where: { id: parent.authorId } }),
  comments: async (parent, args, { prisma }, info) =>
    await prisma.comment.findMany({ where: { postId: parent.id } }),
};

export { Post as default };
