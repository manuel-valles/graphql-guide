const users = [
  {
    id: '1',
    name: 'Manu',
    email: 'manu@gmail.com',
    age: 30,
  },
  {
    id: '2',
    name: 'Mar',
    email: 'mar@gmail.com',
  },
];

const posts = [
  {
    id: '1',
    title: 'GraphQL 001',
    body: 'This is how to use GraphQL.',
    published: true,
    author: '1',
  },
  {
    id: '2',
    title: 'GraphQL 002',
    body: 'This is about advanced GraphQL.',
    published: false,
    author: '1',
  },
  {
    id: '3',
    title: 'Programming Music',
    body: '',
    published: false,
    author: '2',
  },
];

const comments = [
  {
    id: '1',
    text: 'Comment 001',
    author: '1',
    post: '1',
  },
  {
    id: '2',
    text: 'Comment 002',
    author: '1',
    post: '2',
  },
  {
    id: '3',
    text: 'Comment 003',
    author: '2',
    post: '1',
  },
  {
    id: '4',
    text: 'Comment 004',
    author: '2',
    post: '2',
  },
];

const db = {
  users,
  posts,
  comments,
};

export { db as default };
