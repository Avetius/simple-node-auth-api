/* eslint-disable prefer-arrow-callback */
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import chalk from 'chalk';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
// import slack from './src/libs/slack';
import { error404, error500 } from './src/utilities';

import * as passportAuth from './src/middlewares/authentication';
import userRoutes from './src/auth/auth.rt';

const { pass: passport } = passportAuth;

// const corsOptions = {
//   origin: 'https://dev.api.cybernate.am',
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

const whitelist = ['localhost', 'http://localhost', 'https://localhost', '127.0.0.1'];
const corsOptions = {
  origin(origin, callback) {
    console.log('origin >>> ', origin);
    if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

class ExpressApp {
  constructor() {
    this.config = this.config.bind(this);
    this.routesConfig = this.routesConfig.bind(this);
    this.app = express();
    this.router = express.Router();
    this.config();
    this.routesConfig();
  }

  config() {
    this.app.use(helmet.xssFilter());
    this.app.disable('x-powered-by');
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      next();
    });

    this.app.use(cors(corsOptions));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(morgan('combined'));
    this.app.use(passport.initialize());
    this.app.use(methodOverride());
  }

  routesConfig() {
    this.router.use('/users', userRoutes);

    this.app.use(process.env.API_VERSION, this.router);

    // Handle 404
    this.app.use(error404);

    // Handle 500
    this.app.use(error500);
  }
}

const expressApp = new ExpressApp();
const { app } = expressApp;

const port = process.env.PORT || 8080;
const httpsServer = http.createServer(app); // https.createServer(credentials, app);
httpsServer.listen(port);
process.on('unhandledRejection', async (reason, promise) => {
  console.log('unhandled rejection -> ', promise, 'reason', reason);
  // await slack.send(`@Avet process unhandled rejection -> ${JSON.stringify(reason)}, ${promise}`);
  process.exit(1);
});

process.on('UnhandledPromiseRejectionWarning', async (reason, promise) => {
  console.log('unhandled rejection -> ', promise, 'reason', reason);
  // await slack.send(`@Avet process unhandled promise rejection -> ${JSON.stringify(reason)}, ${promise}`);
  process.exit(1);
});

// const nets = networkInterfaces();
// ==================================
console.log(chalk.red(`UNDP_backend \t\t\t ${process.env.DB_host}`));
console.log(chalk.blue(`Port:\t\t\t\t :${port}`));
console.log(chalk.yellow(`Bololo:\t\t\t\t ${process.env.API_VERSION}`));
