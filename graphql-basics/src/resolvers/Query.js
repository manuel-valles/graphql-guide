const isMatch = (query, elementToMatch) =>
  elementToMatch.toLocaleLowerCase().includes(query.toLocaleLowerCase());

const Query = {
  greeting: (parent, args, ctx, info) =>
    `Hello${args.name ? `, ${args.name}` : '!'}`,
  add: (parent, { numbers }, ctx, info) => numbers.reduce((a, b) => a + b, 0),
  grades: (parent, args, ctx, info) => [99, 88],
  users: (parent, { query }, { db }, info) =>
    query ? db.users.filter((user) => isMatch(query, user.name)) : db.users,
  posts: (parent, { query }, { db }, info) =>
    query
      ? db.posts.filter(
          (post) => isMatch(query, post.title) || isMatch(query, post.body)
        )
      : db.posts,
  comments: (parent, args, { db }, info) => db.comments,
  me: () => ({
    id: '123',
    name: 'Manuel Valles',
    email: 'manukempo@gmail.com',
    age: null,
  }),
};

export { Query as default };
