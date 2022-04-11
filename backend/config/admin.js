module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '1cf97a4d5f8d60650da16184359470e1'),
  },
});
