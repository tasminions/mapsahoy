module.exports = {
  method: 'GET',
  path: '/logout',
  handler: function(request, reply) {
    reply.redirect('/').state('jwt', '');
  }
}
