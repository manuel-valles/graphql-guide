const User = {
  posts: (parent, args, { prisma }, info) =>
    prisma.post.findMany({ where: { authorId: parent.id } }),
  comments: (parent, args, { prisma }, info) =>
    prisma.comment.findMany({ where: { authorId: parent.id } }),
};

export { User as default };
