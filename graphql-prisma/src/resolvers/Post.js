const Post = {
  author: (parent, args, { prisma }, info) =>
    prisma.post.findUnique({ where: { id: parent.id } }).author(),
  comments: (parent, args, { prisma }, info) =>
    prisma.post.findUnique({ where: { id: parent.id } }).comments(),
};

export { Post as default };
