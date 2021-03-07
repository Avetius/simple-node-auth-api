import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { Users, admin_fields } from './auth.mdl';
import transporter from '../libs/email';
import { response, responsWithError, serverError } from '../utilities';
import knex from '../base';

const secret = process.env.SECRET;

export default class UserController {
  static async login(req, res) {
    try {
      const { login, password } = req.body;

      const [user] = await Users.query().select('*').limit(1) // .withGraphFetched('profile')
        .where(knex.raw(`LOWER("email") = '${login.toLowerCase()}'`))
        .orWhere(knex.raw(`LOWER("login") = '${login.toLowerCase()}'`));

      if (user) {
        if (user.blocked) {
          const error = { code: 400, message: 'user blocked' };
          return responsWithError(error, req, res);
        }
        if (!user.verified_email) {
          const error = { code: 400, message: 'please verify your email' };
          return responsWithError(error, req, res);
        }
        const samePassword = bcrypt.compareSync(password, user.password);
        if (samePassword) {
          const result = Object.assign(user, {
            token: jwt.sign({
              id: user.id,
            }, secret, { expiresIn: 60 * 60 }), // 60 * 60
          });
          delete result.password;
          return response(res, result);
        }
      }
      const error = { code: 400, message: 'wrong credentials' };
      return responsWithError(error, req, res);
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async signup(req, res, next) {
    try {
      const {
        email,
        login,
        phone,
        password,
      } = req.body;

      const role = 'client';
      return await knex.transaction(async (trx) => {
        const userQuery = Users.query(trx).insert({
          email,
          login,
          phone,
          role,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(8), null),
          verified_email: false,
          email_verification_token: uuid(),
        })
          .returning(admin_fields);

        const user = await userQuery;
        if (!user) return response(res, { code: '400', message: 'no such user' });
        delete user.password;

        return transporter.sendMail({
          from: process.env.EMAIL,
          to: user.email,
          subject: 'Email verification',
          html: `Dear client!  <br>
        If you registered please verify your mail by <a href="${process.env.HOST}/users/verify_email/${user.email_verification_token}">clicking to this link</a> otherwise just ignore it`,
        }, (err, info) => {
          if (err) {
            return Users.query().where({ id: user.id }).delete()
              .then(() => res.status(500).send({ code: 500, message: 'Error sending email verification' }))
              .catch((e) => next(e));
          }
          if (info) console.log('email sending done!');
          return response(res, user);
        });
        // return response(res, user);
      });
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { body } = req;

      const user = await Users.query()
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
      if (!user) return response(res, { code: '400', message: 'no such user' });
      const token = user.email_verification_token;
      return await transporter.sendMail({
        from: 'workspaceimm@gmail.com',
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
      const [user] = await Users.query()
        .select('*')
        .where({ email_verification_token: token })
        .limit(1);

      const samePassword = bcrypt.compareSync(old_password, user.password);
      console.log('samePassword', samePassword);
      if (samePassword) {
        await Users.query()
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
      const [user] = await Users.query()
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
      const user = await Users.query()
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
      await Users.query()
        .patch({ verified_email: true })
        .where({ email_verification_token: token });

      return response(res, 'ok');
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async list(req, res) {
    try {
      const users = await Users.query()
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
      const user = await Users.query()
        .delete()
        .where({ id });

      return response(res, user);
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async assignMentor(req, res) {
    try {
      const { mentor_id, startup_ids } = req.params;
      const mentorPromise = Users.query()
        .select('id')
        .where({ id: mentor_id, role: 'mentor' })
        .limit(1);
      const startupsPromise = Users.query()
        .select('id')
        .where({ role: 'startup' })
        .whereIn({ id: startup_ids })
        .limit(1);
      const [mentor, startups] = await Promise.all([mentorPromise, startupsPromise]).catch((e) => {
        console.log('assignMentor > ', e);
      });
      if (mentor && startups.length > 0) {
        const result = Users.relatedQuery('mentors')
          .for(mentor_id)
          .relate(startup_ids);
        return response(res, result);
      }
      const err = { code: 400, message: 'either mentor or startups didn\'t found' };
      throw err;
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async blockUser(req, res) {
    try {
      const { user_id } = req.body;
      const user = await Users.query()
        .patch({ blocked: 'true' })
        .where({ id: user_id })
        .whereNot({ role: 'superadmin' });

      return response(res, user);
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }

  static async blockAdmin(req, res) {
    try {
      const { user_id } = req.body;
      const user = await Users.query()
        .patch({ blocked: 'true' })
        .where({ id: user_id, role: 'admin' });

      return response(res, user);
    } catch (e) {
      return responsWithError(serverError, req, res, e);
    }
  }
}
