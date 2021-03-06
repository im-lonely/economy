import Discord from "discord.js";
import { config as dotenv } from "dotenv";
import ms from "ms";
import Command, { Category } from "./Command";
import { Blacklisted, CurrencyShop, levels, Users } from "./dbObjects";
import init from "./load";
import parseUsers from "./utils/parseUsers";

dotenv();

export { Blacklisted, CurrencyShop, Users };

const intents = new Discord.Intents([Discord.Intents.NON_PRIVILEGED, "GUILD_MEMBERS"]);

const prefix = process.env.PREFIX!;
const devs = [process.env.DEVS!];

export const client = new Discord.Client({
    ws: { intents },
});

client.commands = new Discord.Collection<string, Command>();

const cooldowns = new Discord.Collection<string, Discord.Collection<string, number>>();

init(client);

client.on("message", async (message) => {
    if (message.author.bot || !message.content.startsWith(process.env.PREFIX!) || !message.guild) return;

    if (
        await Blacklisted.findOne({
            where: {
                user_id: message.author.id,
            },
        })
    ) {
        const blacklisted = await Blacklisted.findOne({
            where: {
                user_id: message.author.id,
            },
        });

        if (blacklisted.notified) return;

        blacklisted.notified = true;

        return message.author.send(`You have been blacklisted for ${blacklisted.reason}.`);
    }

    let user = await Users.findOne({
        where: {
            user_id: message.author.id,
        },
    });

    if (!user) user = await Users.create({ user_id: message.author.id, balance: 0 });

    const args = message.content.slice(process.env.PREFIX!.length).trim().split(/ +/);
    const commandName = args.shift()!.toLowerCase();

    if (!commandName) return;

    const command: Command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.category === Category.DEV && !devs.includes(message.author.id)) return;

    if (command.args && !args.length) {
        return message.channel.send(
            `The usage of \`${command.name}\` is \`${command.usage}\`. Use \`${process.env.PREFIX}help ${command.name}\` for more info.`
        );
    }

    for (const user of parseUsers(args, message)) {
        if (
            !(await Users.findOne({
                where: {
                    user_id: user?.id,
                },
            }))
        ) {
            await Users.create({
                user_id: user?.id,
            });
        }
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps!.has(message.author.id)) {
        const expirationTime = timestamps!.get(message.author.id)! + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = expirationTime - now;
            return message.channel.send(
                `Please wait ${
                    ms(Math.round(timeLeft), {
                        long: true,
                    }).endsWith("ms")
                        ? `${(timeLeft / 1000).toFixed(1)} seconds`
                        : ms(Math.round(timeLeft), {
                              long: true,
                          })
                } before reusing the \`${command.name}\` command.`
            );
        }
    }

    try {
        if ((await command.execute(message, args, client)) !== "invalid") {
            user.increment("max_bank", {
                by: Math.round(Math.random()),
            });
            user.increment("exp", {
                by: command.cooldown > 60 ? 60 : command.cooldown,
            });
            if (user.exp <= levels[levels.length - 1].exp) {
                user.level = levels.find((l) => user.exp < l.exp)?.level;
            } else {
                user.level = levels[levels.length - 1].level;
            }
            user.save();
            timestamps!.set(message.author.id, now);
            setTimeout(() => timestamps!.delete(message.author.id), cooldownAmount);
        }
    } catch (err) {
        console.error(err);
        message.channel.send("Something went wrong!");
    }
});

client.login(process.env.TOKEN);
