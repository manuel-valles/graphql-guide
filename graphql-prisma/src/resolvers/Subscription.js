const Subscription = {
  comment: {
    subscribe: async (parent, { postId }, { prisma, pubsub }, info) => {
      // ToDo: Check if post is published
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
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
