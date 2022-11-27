import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from './user.mdl';
import { Login } from './login.mdl';
import { Phone } from './phone.mdl';
import transporter from '../libs/email';
import { response, responsWithError, serverError } from '../utilities';
import knex from '../base';

export default class UserController {
  static login(req, res) {
    console.log('bolyolyo login');
    return response(res, req.user);
  }

  static facebookCB(req, res) {
    console.log('req.profile > ', req.profile);
    console.log('req.user > ', req.user);
    console.log('req.query > ', req.query);
    console.log('req.params > ', req.params);
    return response(res, { message: 'ok' });
  }

  static async signup(req, res) {
    try {
      const signupRole = (req.body.role === 'client' || req.body.role === 'partner')
        ? req.body.role
        : 'client';
      const hashPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
      return await knex.transaction(async (trx) => {
        const createUser = await User.query(trx).insert({
          role: signupRole,
        }).returning('id');
        // create login
        const createlogin = await Login.query(trx).insert({
          user_id: createUser.id,
          email: req.body.email,
          login: req.body.login,
          password: hashPassword,
          verified_email: false,
          email_verification_token: uuid(),
        }).returning('*');
        if (!createlogin) return response(res, { code: '400', message: 'Login or Email are already in use' });
        // create phone
        const createPhone = await Phone.query(trx).insert({
          user_id: createUser.id,
          country_code: req.body.country_code,
          number: req.body.number,
        }).returning('id');
        if (!createPhone) return response(res, { code: '400', message: 'Phone is already registered' });
        const info = await transporter.sendMail({
          from: process.env.EMAIL,
          to: createlogin.email,
          subject: 'Email verification',
          html: `Dear client!  <br>
          If you registered please verify your mail by <a href="${process.env.HOST}/users/verify_email/${createlogin.email_verification_token}">clicking to this link</a> otherwise just ignore it`,
        }).catch((mailError) => mailError);
        console.log('Verification mail sent >>> ', info);
        return response(res, {});
      });
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { body } = req;

      const user = await User.query()
        .findById(id)
        .patch(body);
      return response(res, user);
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async changePasswordEmail(req, res) {
    try {
      const { user } = req;
      if (!user.login) return response(res, { code: '400', message: 'no registered email' });
      const token = user.email_verification_token;
      return await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Password change request',
        html: `Dear ${user.contact_name} ${user.contact_surname}!  <br> 
        We recieved your request to change password. If it was NOT you please leave this message untouched. <br>
        To proceed for password change <a href="${process.env.HOST}/users/changePassword/${token}">click here</a>`,
      }, (err, info) => {
        console.log('info > ', info);
        console.log('err > ', err);
        if (err) {
          return res.status(500).send({ code: 500, message: 'Error sending recovery email' });
        }
        return response(res, { ok: 'ok' });
      });
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async changePassword(req, res) {
    try {
      const { old_password, new_password } = req.body;
      const { token } = req.params;
      const [user] = await User.query()
        .select('*')
        .where({ email_verification_token: token })
        .limit(1);

      const samePassword = bcrypt.compareSync(old_password, user.password);
      console.log('samePassword', samePassword);
      if (samePassword) {
        await User.query()
          .findById(req.user.id)
          .patch({ password: bcrypt.hashSync(new_password, bcrypt.genSaltSync(8), null) });

        delete user.password;
        return response(res, user);
      }
      const err = { code: 400, message: 'wrong password' };
      throw err;
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async forgotPassword(req, res) {
    try {
      // .replace(/\W/g, '')
      const { email } = req.body;
      const [user] = await User.query()
        .select('*')
        .where({ email })
        .limit(1);

      if (!user) return response(res, { code: '400', message: 'no such user' });
      const token = user.email_verification_token;
      return await transporter.sendMail({
        from: 'workspaceimm@gmail.com',
        to: user.email,
        subject: 'Password change request',
        html: `Dear ${user.contact_name} ${user.contact_surname}!  <br> 
        We recieved your request to change password. If it was NOT you please leave this message untouched. <br>
        To proceed for password change <a href="${process.env.HOST}/users/forgotPassword/${token}">click here</a>`,
      }, (err, info) => {
        console.log('info > ', info);
        console.log('err > ', err);
        if (err) {
          return res.status(500).send({ code: 500, message: 'Error sending recovery email' });
        }
        return response(res, { ok: 'ok' });
      });
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async recoverPassword(req, res) {
    try {
      const { password } = req.body;
      const { token } = req.params;
      const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
      const user = await User.query()
        .patch({ password: hashed })
        .where({ email_verification_token: token });

      if (user) {
        delete user.password;
        return response(res, user);
      }
      const err = { code: 400, message: 'something went wrong' };
      throw err;
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async verify_email(req, res) {
    try {
      const { token } = req.params;
      console.log('token > ', token);
      await User.query()
        .patch({ verified_email: true })
        .where({ email_verification_token: token });

      return response(res, 'ok');
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async list(req, res) {
    try {
      const users = await User.query()
        .withGraphFetched('accelerators')
        .withGraphFetched('meetings')
        .withGraphFetched('events')

        .select('*')
        .where(req.query);

      return response(res, users);
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const user = await User.query()
        .delete()
        .where({ id });

      return response(res, user);
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async block(req, res) {
    try {
      const { user_id } = req.body;
      const user = await User.query()
        .patch({ blocked: 'true' })
        .where({ id: user_id })
        .whereNot({ role: 'superadmin' });

      return response(res, user);
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }
}
