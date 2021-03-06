import { Op } from "sequelize";
import Command, { Category } from "../../../Command";
import { CurrencyShop, Users } from "../../../dbObjects";

export default {
  name: "use",
  aliases: [],
  args: true,
  usage: "<item>",
  category: Category.ECONOMY,
  description: "Use an item",
  cooldown: 15,
  async execute(message, args, client) {
    const user = await Users.findOne({
      where: {
        user_id: message.author.id,
      },
    });

    const item = await CurrencyShop.findOne({
      where: { name: { [Op.like]: args[0] } },
    });

    if (!item) {
      message.channel.send("That item doesn't exist!");
      return "invalid";
    }

    const userItem = (await user.getItems()).find(
      (i: any) => i.dataValues.item.name === item.dataValues.name
    );

    if (userItem.dataValues.amount < 1 || !userItem) {
      message.channel.send("You don't have that item!");
      return "invalid";
    }

    if (item.type.startsWith("USE")) {
      switch (item.name) {
        case "Magnet":
          const magnetCoins = Math.floor(Math.random() * 5 + 5);
          user.increment("balance", {
            by: magnetCoins,
          });
          user.save();
          return message.channel.send(
            `You found ${magnetCoins} coins with your trusty magnet!`
          );
        case "Sunglasses":
          const sunglassesPerk = Math.round(Math.random() * 2 + 2);
          user.increment("multiplier", {
            by: sunglassesPerk,
          });
          user.save();
          userItem.decrement("amount");
          userItem.save();
          return message.channel.send(
            `You wear your cool shades and gain ${sunglassesPerk} as a perk! ~~Unfortunately the expensive sunglasses were cheaply made and broke as a result~~`
          );
        case "Computer":
          if (Math.random() > 0.95) {
            userItem.decrement("amount");
            userItem.save();
            return message.channel.send(
              "Your dank meme was taken down for being low effort and you raged, breaking your computer!"
            );
          }

          const memes = [
            {
              min: 10,
              max: 15,
              reply: "with a few upvotes and got $ coins",
            },
            {
              min: 12,
              max: 18,
              reply: "with a some upvotes and gained $ coins",
            },
            {
              min: 15,
              max: 22,
              reply: "with a lot of upvotes and you got $ coins from ads",
            },
            {
              min: 18,
              max: 25,
              reply: "with a over 1000 upvotes and the ads earned $ coins",
            },
            {
              min: 25,
              max: 30,
              reply: "with an incredible amount of upvotes and got $ coins",
            },
            {
              min: 30,
              max: 40,
              reply: "with a over 10000 upvotes and earned $ coins from ads",
            },
          ];

          const chosenMeme = memes[Math.floor(Math.random() * memes.length)];

          const { min, max, reply } = chosenMeme;

          const memeCoins = Math.round(Math.random() * (max - min) + min);

          user.income(memeCoins);

          return message.channel.send(`You posted a dank meme **${reply}**!`);
      }
    } else {
      message.channel.send(
        "You can't use this item!" + item.edible
          ? "\nTo use this item you must eat it!"
          : ""
      );
      return "invalid";
    }
  },
} as Command;
