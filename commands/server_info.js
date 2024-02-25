const { CommandType } = require("wokcommands");
const {
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder,
} = require("discord.js");

const handleInteractionError = require("../handleInteractionError");
module.exports = {
	// Required for slash commands
	description: "Get info about a rust server",
	// Create a legacy and slash command
	type: CommandType.SLASH,
	options: [
		{
			name: "server_name",
			description: "name of the server",
			type: 3,
			required: true,
		},
	],
	//  nvoked when a user runs the ping command
	callback: async ({ interaction }) => {
		try {
			const { options } = interaction;

			const serverName = options.getString("server_name");

			const res = await fetch(
				`https://api.battlemetrics.com/servers?filter[search]=${serverName}&filter[game]=rust&filter[status]=online`,
			);

			const { data: fetchedServerList } = await res.json();

			if (fetchedServerList.length === 0)
				throw new Error("Could not find any server matching that name.");

			const selectMenuOptions = fetchedServerList.map((server) => {
				return new StringSelectMenuOptionBuilder()
					.setLabel(server.attributes?.name)
					.setDescription(`Server with ${server.attributes?.players} players.`)
					.setValue(server.id);
			});

			const select = new StringSelectMenuBuilder()
				.setCustomId("serverSelector")
				.setPlaceholder("Make a selection!")
				.addOptions(...selectMenuOptions);

			const row = new ActionRowBuilder().addComponents(select);

			await interaction.reply({
				content: "Choose your server!",
				components: [row],
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);
			handleInteractionError(error.message, interaction);
		}
	},
};
