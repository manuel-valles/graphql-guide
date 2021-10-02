import server from './server';

const port = process.env.PORT || 4000;

server.start({ port }, () =>
  console.log(
    `Server started, listening on port ${port} for incoming requests.`
  )
);
