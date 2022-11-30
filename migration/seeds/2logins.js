const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('logins').del()
    .then(() => knex('logins').insert([
      {
        email: 'avet.sargsyan@yahoo.com',
        user_id: 1,
        login: 'avet_sargsyan',
        password: bcrypt.hashSync('ASDasd123$', bcrypt.genSaltSync(8), null),
        email_verification_token: uuid(),
        verified_email: true,
      },
    ]));
};
