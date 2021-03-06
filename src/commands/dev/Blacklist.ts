import Command, { Category } from "../../Command";
import { Blacklisted } from "../../dbObjects";

export default {
  name: "blacklist",
  aliases: [""],
  args: true,
  usage: "<id|'all'>",
  category: Category.DEV,
  description: "Blacklist a user",
  cooldown: 0,
  async execute(message, args, client) {
    if (args[0] === "all") {
      const blacklist = await Blacklisted.findAll();
      if (!blacklist.length)
        return message.channel.send("No blacklisted users.");
      for (let i = 0; i < blacklist.length; i += 100) {
        message.channel.send(
          blacklist
            .slice(i)
            .map((b: any) => `\`${b.dataValues.id}\``)
            .join("\n")
        );
      }
      return;
    }

    if (!/^\d{18}$/.test(args[0]))
      return message.channel.send("Enter a valid id.");

    const reason = args.slice(1).join(" ");

    if (!reason.length) return message.channel.send("Enter a valid reason.");

    Blacklisted.create({
      user_id: args[0],
      reason: reason,
      notified: false,
    });

    return message.channel.send(
      `Blacklisted user \`${args[0]}\` for \`${reason}\`.`
    );
  },
} as Command;
