const User = {
  posts: (parent, args, { prisma }, info) =>
    prisma.user.findUnique({ where: { id: parent.id } }).posts(),
  comments: (parent, args, { prisma }, info) =>
    prisma.user.findUnique({ where: { id: parent.id } }).comments(),
};

export { User as default };
