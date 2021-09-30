const Subscription = {
  comment: {
    subscribe: async (parent, { postId }, { prisma, pubsub }, info) => {
      const [post] = await prisma.post.findMany({
        where: {
          AND: [{ id: postId }, { published: true }],
        },
      });

      if (!post) throw new Error('Post not found');

      return pubsub.asyncIterator(`comment ${postId}`);
    },
  },
  post: {
    subscribe: (parent, args, { pubsub }, info) => pubsub.asyncIterator('post'),
  },
};

export { Subscription as default };
