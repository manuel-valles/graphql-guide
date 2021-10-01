import getUserId from '../utils/getUserId';

const User = {
  email: (parent, args, { request }) => {
    const userId = getUserId(request, false);

    return userId === parent.id ? parent.email : null;
  },
  posts: (parent, args, { prisma }) =>
    prisma.user
      .findUnique({ where: { id: parent.id } })
      .posts({ where: { published: true } }),
  comments: (parent, args, { prisma }) =>
    prisma.user.findUnique({ where: { id: parent.id } }).comments(),
};

export { User as default };
