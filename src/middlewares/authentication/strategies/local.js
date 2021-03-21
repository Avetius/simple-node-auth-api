import jwt from 'jsonwebtoken';
import Strategy from 'passport-local';
import bcrypt from 'bcrypt';
import { Login } from '../../../user/login.mdl';
import knex from '../../../base';

const secret = process.env.SECRET;
// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

export default new Strategy({
  // by default, local strategy uses username and password, we will override with email
  usernameField: 'login',
  passwordField: 'password',
  // passReqToCallback: true, // allows us to pass back the entire request to the callback
  session: false,
},
async (login, password, done) => { // callback with email and password from our form
  const [userLogin] = await Login.query().select('*')
    .withGraphFetched('user')
    .modifyGraph('user', (builder) => {
      builder
        .select('id', 'role', 'blocked', 'block_reason', 'avatar', 'background', 'created_at', 'updated_at', 'deleted_at')
        .orderBy('id')
        .withGraphFetched('login', (loginBuilder) => {
          loginBuilder.select('email', 'login', 'verified_email');
        })
        .withGraphFetched('phones', (phoneBuilder) => {
          phoneBuilder.select('country_code', 'number', 'verified_phone');
        })
        .withGraphFetched('client_profile', (clientBuilder) => {
          clientBuilder.select('firstname', 'lastname', 'prefix', 'dob', 'avatar', 'background');
        })
        .withGraphFetched('partner_profile', (partnerBuilder) => {
          partnerBuilder.select('companyname', 'address1', 'address2', 'phone', 'logo', 'background');
        })
        .withGraphFetched('social_networks', (loginBuilder) => {
          loginBuilder.select('provider', 'provider_id', 'profile_url', 'display_name', 'gender', 'emails', 'photos', 'family_name', 'given_name', 'middle_name');
        });
    })
    .where(knex.raw(`LOWER("email") = '${login.toLowerCase()}'`))
    .orWhere(knex.raw(`LOWER("login") = '${login.toLowerCase()}'`))
    .limit(1)
    .catch((e) => { done(e, null); });

  console.log('userLogin > ', userLogin);
  if (userLogin) {
    if (userLogin.user.blocked) {
      const error = { code: 400, message: 'user blocked' };
      return done(error, null);
    }
    if (!userLogin.verified_email) {
      const error = { code: 400, message: 'please verify your email' };
      return done(error, null);
    }
    const samePassword = await bcrypt.compare(password, userLogin.password)
      .catch((bcryptError) => done(bcryptError, null));
    if (samePassword) {
      const result = Object.assign(userLogin.user, {
        token: jwt.sign({
          id: userLogin.user.id,
        }, secret, { expiresIn: 60 * 60 }), // 60 * 60
      });
      delete result.password;
      return done(null, result);
    }
    const error = { code: 400, message: 'wrong credentials' };
    return done(error, null);
  }
  const error = { code: 400, message: 'wrong credentials' };
  return done(error, null);
});
