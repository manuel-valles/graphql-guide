const Comment = {
  author: async (parent, args, { prisma }, info) =>
    await prisma.user.findUnique({ where: { id: parent.authorId } }),
  post: async (parent, args, { prisma }, info) =>
    await prisma.post.findUnique({ where: { id: parent.postId } }),
};

export { Comment as default };
