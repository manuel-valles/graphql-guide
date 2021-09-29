import { prisma } from '.prisma/client';

const isMatch = (query, elementToMatch) =>
  elementToMatch.toLocaleLowerCase().includes(query.toLocaleLowerCase());

const Query = {
  users: (parent, { query }, { prisma }, info) =>
    query
      ? prisma.user.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
        })
      : prisma.user.findMany(),
  posts: (parent, { query }, { prisma }, info) =>
    query
      ? prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { body: { contains: query, mode: 'insensitive' } },
            ],
          },
        })
      : prisma.post.findMany(),
  comments: (parent, args, { prisma }, info) => prisma.comment.findMany(),
};

export { Query as default };
