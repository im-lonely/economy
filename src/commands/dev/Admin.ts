import { Op } from "sequelize";
import Command, { Category } from "../../Command";
import { CurrencyShop, Users } from "../../dbObjects";

export default {
  name: "admin",
  aliases: ["administrator", "sudo", "superuserdo"],
  args: true,
  usage: "<command> <args>",
  category: Category.DEV,
  description: "Execute admin commands",
  cooldown: 0,
  async execute(message, args, client) {
    const user = await Users.findOne({
      where: {
        user_id: message.author.id,
      },
    });

    switch (args[0]) {
      case "give":
        const amount = parseInt(args[1]);
        if (!args[2]) {
          user.increment("balance", {
            by: amount,
          });
          user.save();
          return message.channel.send(
            `\`\`\`economy: give: given ${amount} coins to ${message.author.username}\`\`\``
          );
        } else {
          const item = await CurrencyShop.findOne({
            where: { name: { [Op.like]: args[2] } },
          });

          if (!item)
            return message.channel.send(
              `\`\`\`economy: give: could not find item ${args[1]}\`\`\``
            );

          let userItem = (await user.getItems()).find(
            (i: any) => i.dataValues.item.name === item.name
          );

          if (!userItem) {
            userItem = await user.addItem(item);
            userItem.increment("amount", {
              by: amount - 1,
            });
          } else {
            userItem.increment("amount", {
              by: amount,
            });
          }
          user.save();
          userItem.save();

          return message.channel.send(
            `\`\`\`economy: give: given ${amount} items to ${message.author.username}\`\`\``
          );
        }
      case "clear":
        switch (args[1]) {
          case "bal":
            const bal = user.balance;
            user.balance = 0;
            user.save();
            return message.channel.send(
              `\`\`\`economy: clear: bal: cleared ${bal} coins\`\`\``
            );
          case "bank":
            const bank = user.bank;
            user.bank = 0;
            user.save();
            return message.channel.send(
              `\`\`\`economy: clear: bank: cleared ${bank} coins\`\`\``
            );
          case "max_bank":
            const max_bank = user.max_bank;
            if (user.bank > 250) user.bank = 250;
            user.max_bank = 250;
            user.save();
            return message.channel.send(
              `\`\`\`economy: clear: max_bank: cleared ${max_bank} coins\`\`\``
            );
          case "inv":
            const totalItems =
              (await user.getItems()).reduce(
                (acc: any, cur: any) => acc + cur.dataValues.amount,
                0
              ) || 0;

            (await user.getItems()).forEach((item: any) => {
              item.destroy();
            });
            return message.channel.send(
              `\`\`\`economy: clear: inv: cleared ${totalItems} items\`\`\``
            );
          case "level":
            const level = user.level;
            user.level = 0;
            user.exp = 0;
            user.save();
            return message.channel.send(
              `\`\`\`economy: clear: level: cleared ${level} levels\`\`\``
            );
          case "kill":
            user.kill();
            return message.channel.send(
              `\`\`\`economy: clear: kill: cleared everything\`\`\``
            );
          default:
            return message.channel.send(
              `\`\`\`economy: clear: ${args[1]}: command not found\`\`\``
            );
        }
      case "delete":
        user.destroy();
        return message.channel.send(
          `\`\`\`economy: delete: deleted user ${message.author.id}\`\`\``
        );
      case "exp":
        user.exp += parseInt(args[1]) || 100;
        user.save();
        return message.channel.send(
          `\`\`\`economy: exp: gave ${parseInt(args[1]) || 100} exp to user ${
            message.author.id
          }\`\`\``
        );
      default:
        return message.channel.send(
          `\`\`\`economy: ${args[0]}: command not found\`\`\``
        );
    }
  },
} as Command;
