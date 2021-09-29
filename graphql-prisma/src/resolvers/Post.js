const Post = {
  author: (parent, args, { prisma }, info) =>
    prisma.user.findUnique({ where: { id: parent.authorId } }),
  comments: (parent, args, { prisma }, info) =>
    prisma.comment.findMany({ where: { postId: parent.id } }),
};

export { Post as default };
