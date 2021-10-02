import ApolloClient, { gql } from 'apollo-boost';

const client = new ApolloClient({
  uri: 'http://localhost:4000',
});

const getUsers = gql`
  query {
    users {
      name
    }
  }
`;

client
  .query({
    query: getUsers,
  })
  .then(({ data }) => {
    let html = '';
    data.users.forEach((user) => {
      html += `
        <div>
            <h3>${user.name}</h3>
        </div>
        `;
    });
    document.getElementById('users').innerHTML = html;
  });

const getPosts = gql`
  query {
    posts {
      title
      author {
        name
      }
    }
  }
`;

client
  .query({
    query: getPosts,
  })
  .then(({ data }) => {
    let html = '';
    data.posts.forEach((post) => {
      html += `
        <div>
            <h3>${post.title}</h3>
            <h4>${post.author.name}</h4>
        </div>
        `;
    });
    document.getElementById('posts').innerHTML = html;
  });
