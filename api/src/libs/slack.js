import 'dotenv/config';
import SlackWebhook from 'slack-webhook';

const slack = new SlackWebhook(process.env.SLACK_WEBHOOK, {
  defaults: {
    username: 'Bot',
    channel: process.env.SLACK_CHANNEL,
    icon_emoji: ':robot_face:',
  },
});

slack.send('Server is up and running...');

export default slack;
