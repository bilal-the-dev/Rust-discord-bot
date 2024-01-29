import path from "path";
import { GameDig } from "gamedig";

import { Client, IntentsBitField, Partials, ActivityType } from "discord.js";
import WOK from "wokcommands";
import dotenv from "dotenv";

dotenv.config({
	path: "./.env",
});

const { DefaultCommands } = WOK;
const { TOKEN } = process.env;
const serverData = [
	{
		address: "104.206.80.154",
		port: 14010,
		serverType: "#1",
	},
	{
		address: "104.206.80.154",
		port: 14210,
		serverType: "#2",
	},
	{
		address: "104.206.80.154",
		port: 14310,
		serverType: "DM",
	},
];

let serverCount = 0;

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.MessageContent,
	],
	partials: [Partials.Channel],
});

client.on("ready", async () => {
	console.log(`${client.user.username} is running 🤖`);

	setInterval(async () => {
		try {
			const { address, port, serverType } = serverData[serverCount];

			const { numplayers, maxplayers } = await fetchServerData(address, port);

			serverCount < serverData.length - 1 ? serverCount++ : (serverCount = 0);

			client.user.setActivity(`NB ${serverType}: ${numplayers}/${maxplayers}`, {
				type: ActivityType.Watching,
			});
		} catch (error) {
			console.log(error);
		}
	}, 1000 * 15); // 15 secs

	new WOK({
		client,
		commandsDir: path.join(path.resolve(), "./commands"),

		events: {
			dir: path.join(path.resolve(), "events"),
		},

		disabledDefaultCommands: [
			DefaultCommands.ChannelCommand,
			DefaultCommands.CustomCommand,
			DefaultCommands.Prefix,
			DefaultCommands.RequiredPermissions,
			DefaultCommands.RequiredRoles,
			DefaultCommands.ToggleCommand,
		],
		cooldownConfig: {
			errorMessage: "Please wait {TIME} before doing that again.",
			botOwnersBypass: false,

			dbRequired: 300,
		},
	});
});

client.login(TOKEN);

async function fetchServerData(address, port) {
	return await GameDig.query({
		type: "theisle",
		address,
		port,
	}).catch((e) => console.log(e));
}
