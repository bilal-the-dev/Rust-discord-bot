module.exports = async (err, interaction) => {
	const content = `Err! \`${err}\``;

	const reply = { content, ephemeral: true };

	if (!interaction.replied) return await interaction.reply(reply);

	await interaction.followUp(reply);
};
