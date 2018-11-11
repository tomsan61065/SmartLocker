module.exports = {
  db: {
    connection: {
      host: 'pg_db',
      account: 'cped',
      password: 'cped1234cped1234',
    },
    databases: {
      main: 'cped_db',
      preview: 'cped-preview',
      stage: 'cped-stage',
      origin: 'cped-origin',
    },
  },
};
