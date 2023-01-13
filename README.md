<div align='center'>
<h1>Sleepy Maid</h1>
<blockquote>A simple discord utility bot written in Typescript.</blockquote>
</div>

Sleepy Maid is a private utility bot that is used to help with various tasks.
This is the monorepo for all the related package of the bot.
I plan on making this bot public but for now its only available for some specific servers.

## Dependencies

- Nodejs
- Yarn
- Postgresql
- Docker

## Running the bot

1. Copy the `.env.example` file to `.env` and fill in the values.
2. Copy the `compose/docker-compose.config.[ENV].yml.example` file to `compose/docker-compose.config.[ENV].yml` and fill in the values.
3. Run `./dc.sh [ENV] build` to build the bot.
4. Run `./dc.sh [ENV] up -d --remove-orphans` to start the bot.

## Contact me

Join my discord server [https://discord.gg/ecorte](https://discord.gg/8bpy2PC) or send me a message `Ecorte#0003`.

## Contributors

Im not sure why you would want to contribute to this but if you do make a PR and I will be happy to accept it.

<a href="https://github.com/sleepymaidbot/sleepymaid/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sleepymaidbot/sleepymaid" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
