import server from '../../src/server';

const port = process.env.PORT || 4000;

module.exports = async () => {
  global.httpServer = await server.start({ port }, () =>
    console.log(
      `Server started, listening on port ${port} for incoming requests.`
    )
  );
};
