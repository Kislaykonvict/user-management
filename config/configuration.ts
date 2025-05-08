export default () => ({
  port: parseInt(process.env.PORT ?? '8000', 10),
  database: {
    url:
      process.env.DB_URL ||
      'postgresql://postgres:Postgres.28@localhost:5432/userManagement?schema=public',
  },
});