import Command, { Category } from "../../Command";

export default {
  name: "say",
  aliases: ["speak"],
  args: true,
  usage: "<statement>",
  category: Category.FUN,
  description: "Let the bot speak for you!",
  cooldown: 2.5,
  async execute(message, args, client) {
    message.channel.send(args.join(" "));
    message.delete();
  },
} as Command;
