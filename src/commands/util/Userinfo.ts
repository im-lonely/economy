import { MessageEmbed } from "discord.js";
import Command, { Category } from "../../Command";
import parseUsers from "../../utils/parseUsers";

export default {
  name: "userinfo",
  aliases: ["ui"],
  args: false,
  usage: "[user]",
  description: "Displays general user info",
  category: Category.UTIL,
  cooldown: 5,
  async execute(message, args, client) {
    const user = parseUsers(args, message)[0] || message.author;

    return message.channel.send(
      new MessageEmbed()
        .setTitle(user.username)
        .setThumbnail(
          user.displayAvatarURL({
            dynamic: true,
          })
        )
        .setDescription(`Status: \`${user.presence.status}\``)
        .addField("Username", user.username, true)
        .addField("Tag", user.tag, true)
        .addField("Id", user.id)
        .addField("Account created", user.createdAt)
        .setColor("RANDOM")
        .setFooter(message.author.tag)
        .setTimestamp(message.createdAt)
    );
  },
} as Command;
