import 'dotenv/config';
import passportJWT from 'passport-jwt';
import { User } from '../../../user/user.mdl';

const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;

const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;
opts.ignoreExpiration = false;
/* eslint-disable-next-line consistent-return */
const jwt = new JwtStrategy(opts, async (payload, done) => {
  try {
    console.log('bolyolyo');
    const [userLogin] = await User.query()
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
      .select('*')
      .where({ id: payload.id })
      .limit(1);
    if (!userLogin) return done(null, false);
    if (!userLogin.user) return done(null, false);
    if (userLogin.user.blocked) return done({ code: 403, message: 'user blocked' }, false);
    if (!userLogin.user.verified_email) return done({ code: 403, message: 'email not verified' }, false);
    return done(null, userLogin.user);
  } catch (e) {
    return done(null, false);
  }
});

export default jwt;
