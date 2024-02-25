const { Client, IntentsBitField, Partials } = require("discord.js");
const WOK = require("wokcommands");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
	path: "./.env",
});

const { DefaultCommands } = WOK;
const { TOKEN } = process.env;

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

	// client.application.commands.set([]);
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
