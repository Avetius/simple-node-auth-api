import chalk from 'chalk';
import slack from '../libs/slack';

export default async function weblog(args) {
  return slack.send(args).then(console.log(chalk.red(args)))
    .catch((e) => {
      console.log(chalk.red('couldn\'t post error on slack', e));
      console.log(chalk.red('couldn\'t post error on slack', e));
    });
}
