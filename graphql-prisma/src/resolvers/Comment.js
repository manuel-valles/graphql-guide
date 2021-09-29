const Comment = {
  author: (parent, args, { prisma }, info) =>
    prisma.user.findUnique({ where: { id: parent.authorId } }),
  post: (parent, args, { prisma }, info) =>
    prisma.post.findUnique({ where: { id: parent.postId } }),
};

export { Comment as default };
