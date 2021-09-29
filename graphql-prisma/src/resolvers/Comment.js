const Comment = {
  author: (parent, args, { prisma }, info) =>
    prisma.comment.findUnique({ where: { id: parent.id } }).author(),
  post: (parent, args, { prisma }, info) =>
    prisma.comment.findUnique({ where: { id: parent.id } }).post(),
};

export { Comment as default };
