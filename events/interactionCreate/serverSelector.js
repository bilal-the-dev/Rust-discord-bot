const { EmbedBuilder, codeBlock } = require("discord.js");
const handleInteractionError = require("../../handleInteractionError");

module.exports = async (interaction) => {
	try {
		if (!interaction.isStringSelectMenu()) return;

		const { customId, values, guild } = interaction;

		if (customId !== "serverSelector") return;

		await interaction.reply({
			content: "Sending the data please wait...",
			ephemeral: true,
		});

		const res = await fetch(
			`https://api.battlemetrics.com/servers/${values[0]}`,
		);

		const {
			data: { attributes },
		} = await res.json();

		console.log(attributes);
		const {
			name: title,

			players,
			maxPlayers,
			rank,
			ip,
			country,
			details: {
				rust_last_wipe,
				rust_fps_avg,
				rust_queued_players,
				rust_settings,
				rust_headerimage,
				rust_wipes,
			},
		} = attributes;

		let upcomingWipes = "No upcoming wipes";
		if (rust_wipes) upcomingWipes = convertToReadableFormat(rust_wipes, "UTC");

		const currentDate = new Date();
		const rustLastWipeDate = new Date(rust_last_wipe);

		let lastWipe = "No last wipe";
		if (lastWipe)
			lastWipe = formatLastWipe(rustLastWipeDate, currentDate, "UTC");

		const description = `**Rank**: #${
			rank ?? "Unranked"
		}\n**Players**: ${players}/${maxPlayers}\n**Avg FPS**: ${
			rust_fps_avg ?? "No average given"
		}\n**IP**: ${ip}\n**Country**: ${country}\n**Kits**: ${
			rust_settings?.kits ?? "No kits mentioned"
		}\n**Queued Players**: ${rust_queued_players}\n**Last Wipe**: ${lastWipe}\n**Upcoming Wipes**:\n${codeBlock(
			upcomingWipes,
		)}`;

		sendEmbed(values[0], guild, title, description, rust_headerimage);
	} catch (error) {
		console.log(error);
		handleInteractionError(error.message, interaction);
	}
};

async function sendEmbed(
	serverId,
	guild,
	title,
	description,
	rust_headerimage,
) {
	const embed = new EmbedBuilder()
		.setColor("#0349fc")
		.setTitle(title)
		.setURL(`https://www.battlemetrics.com/servers/rust/${serverId}`)

		.setDescription(description)
		.setTimestamp();

	rust_headerimage && embed.setImage(rust_headerimage);

	const channelToSendEmbed = await guild.channels.fetch(
		process.env.channelToSendEmbed,
	);

	await channelToSendEmbed.send({ embeds: [embed] });
}

function formatDateTime(date, timezone) {
	return date.toLocaleString("en-US", {
		timeZone: timezone,
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

function formatDateDifference(date, currentDate) {
	const timeDiff = date - currentDate;
	let timeRemaining;
	if (timeDiff < 0) {
		timeRemaining = "in the past";
	} else if (timeDiff < 3600000) {
		timeRemaining = `in ${Math.round(timeDiff / 60000)} minutes`;
	} else if (timeDiff < 86400000) {
		timeRemaining = `in ${Math.round(timeDiff / 3600000)} hours`;
	} else if (timeDiff < 2592000000) {
		timeRemaining = `in ${Math.round(timeDiff / 86400000)} days`;
	} else {
		const months = Math.floor(timeDiff / 2592000000);
		timeRemaining = `in ${months} ${months === 1 ? "month" : "months"}`;
	}

	return timeRemaining;
}

function formatLastWipe(date, currentDate, timezone) {
	const timeDiff = currentDate - date;
	let result;

	console.log(timeDiff);

	if (timeDiff < 86400000) {
		result = `${Math.round(timeDiff / 3600000)} hours ago`;
	} else if (timeDiff < 2592000000) {
		const days = Math.round(timeDiff / 86400000);
		result = `${days} ${days === 1 ? "day" : "days"} ago`;
	} else {
		const months = Math.round(timeDiff / 2592000000);
		result = `${months} ${months === 1 ? "month" : "months"} ago`;
	}

	const formattedDate = date.toLocaleString("en-US", {
		timeZone: timezone,
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
	});

	console.log(formattedDate);

	return `${formattedDate} - ${result}`;
}

function convertToReadableFormat(data, timezone) {
	const currentDate = new Date();
	const result = [];

	for (const item of data) {
		const itemDate = new Date(item.timestamp);
		const timeRemaining = formatDateDifference(itemDate, currentDate);

		const formattedDate = formatDateTime(itemDate, timezone);

		result.push(
			`${
				item.type.charAt(0).toUpperCase() + item.type.slice(1)
			} - ${formattedDate} - ${timeRemaining}`,
		);
	}

	return result.join("\n");
}
