import Command, { Category } from "../../Command";
import { Blacklisted } from "../../dbObjects";

export default {
  name: "whitelist",
  aliases: [""],
  args: true,
  usage: "<id>",
  category: Category.DEV,
  cooldown: 0,
  description: "Whitelist a user",
  async execute(message, args, client) {
    if (!/^\d{18}$/.test(args[0]))
      return message.channel.send("Enter a valid id.");

    const reason = args.slice(1).join(" ");

    if (!reason.length) return message.channel.send("Enter a valid reason.");

    const blacklist = await Blacklisted.findOne({
      where: {
        user_id: args[0],
      },
    });

    blacklist.destroy();

    if (!blacklist) return message.channel.send("The user is not blacklisted!");

    const user = client.users.cache.get(args[0]);

    if (!user)
      return message.channel.send(
        "Could not find the user, but the id has been whitelisted."
      );

    try {
      user.send(`You have been whitelisted for \`${reason}\`!`);
    } catch (e) {
      message.channel.send(
        `Could not send a message to the user. Friend them instead to contact them: \`${user.username}\``
      );
    }

    return message.channel.send(
      `Whitelisted user \`${args[0]}\` for \`${reason}\`.`
    );
  },
} as Command;
