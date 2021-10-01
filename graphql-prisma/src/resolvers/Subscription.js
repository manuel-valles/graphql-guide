import getUserId from '../utils/getUserId';
import { withFilter } from 'graphql-yoga';

const Subscription = {
  comment: {
    subscribe: async (parent, { postId }, { prisma, pubsub }) => {
      const [post] = await prisma.post.findMany({
        where: {
          AND: [{ id: postId }, { published: true }],
        },
      });

      if (!post) throw new Error('Post not found');

      return pubsub.asyncIterator(`comment ${postId}`);
    },
  },
  // ToDo: add myPost - current issue with null returned
  post: {
    subscribe: withFilter(
      (parent, args, { pubsub }) => pubsub.asyncIterator('post'),
      ({ post }, variables, { request }) => {
        const userId = getUserId(request);
        return post.data.authorId === userId;
      }
    ),
  },
};

export { Subscription as default };
