import ApolloClient from 'apollo-boost';

const port = process.env.PORT || 4000;

const getClient = (jwt) =>
  new ApolloClient({
    uri: `http://localhost:${port}`,
    request: (operation) => {
      if (jwt) {
        operation.setContext({
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
      }
    },
  });

export { getClient as default };
