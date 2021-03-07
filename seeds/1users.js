const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(() => knex('users').insert([
      {
        email: 'avet.sargsyan@yahoo.com',
        login: 'avet_sargsyan',
        phone: '+18187329141',
        role: 'superadmin',
        password: bcrypt.hashSync('ASDasd123$', bcrypt.genSaltSync(8), null),
        verified_email: true,
        verified_phone: true,
        email_verification_token: uuid(),
      },
    ]));
};
