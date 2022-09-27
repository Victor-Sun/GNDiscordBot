const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('rollphasmo').setDescription('Rolls a random Phasmophobia Item'),
	async execute(interaction) {
		const buttons = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('roll').setLabel('Roll').setStyle('PRIMARY'),
			new MessageButton().setCustomId('reset').setLabel('Reset').setStyle('DANGER'),
			new MessageButton().setCustomId('finished').setLabel('Finished').setStyle('SUCCESS')
		);

		const pullButton = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('takeOne').setLabel('Take One').setStyle('SUCCESS'),
			new MessageButton().setCustomId('takeAll').setLabel('Take All').setStyle('PRIMARY')
		)

		const embededMessage = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Phasmophobia Roulette')
			.setURL('https://store.steampowered.com/app/739630/Phasmophobia/')
			.setDescription('Roulette for rolling Phasmophobia items')
			.setThumbnail('https://coelho.ninja/zaDjQsCxx0NcpPQp6ZjALUvmQw8=')
			.addField('Rolled Items', '\u200B')
			.setImage('https://cdn.cloudflare.steamstatic.com/steam/apps/739630/header.jpg?t=1638041534')
			.setTimestamp();

		const embMessage = await interaction.channel.send({ embeds: [embededMessage], components: [buttons] });
		await interaction.reply({ content: 'Roulette Started!', hidden: true });
		interaction.deleteReply();
		const collector = embMessage.createMessageComponentCollector();

		let defaultItems = getDefaultItems(); 
		let rolledItems = [];
		let randomItem = '';

		collector.on('collect', async (ButtonInteraction) => {
			const id = ButtonInteraction.customId;
			const clicker = ButtonInteraction.user

			if (clicker) {
				console.log(clicker)
				console.log(`${ButtonInteraction.customId} Clicked by:  ${clicker.id} - ${clicker.username}`)
			}

			switch (id) {
				case 'roll':
					randomItem = getRandomItem(defaultItems, id === 'takeOne' ? true : false)
					embededMessage.setFields({ name: 'Rolled Items', value: rolledItems.length > 0 ? getEmbdedOutputMessage(rolledItems) : '\u200B' });
					embededMessage.addField('You rolled: ', randomItem)
					embMessage.edit({ embeds: [embededMessage], components: [pullButton] });
					ButtonInteraction.deferUpdate();
					break;
				case 'takeOne':
					addItemToRolledItems(randomItem, defaultItems, rolledItems, true)
					embededMessage.setFields({ name: 'Rolled Items', value: getEmbdedOutputMessage(rolledItems) });
					embMessage.edit({ embeds: [embededMessage], components: [buttons] });
					ButtonInteraction.deferUpdate();
					break;
				case 'takeAll':
					addItemToRolledItems(randomItem, defaultItems, rolledItems, false)
					embededMessage.setFields({ name: 'Rolled Items', value: getEmbdedOutputMessage(rolledItems) });
					embMessage.edit({ embeds: [embededMessage], components: [buttons] });
					ButtonInteraction.deferUpdate();
					break;
				case'finished':
					embededMessage.setFields({name: 'Game Completed', value:'\u200B'})
					embMessage.edit({ embeds: [embededMessage] }).then(e => e.delete())
					break;
				default:
					rolledItems = [];
					defaultItems = getDefaultItems();
					embededMessage.setFields({ name: 'Rolled Items', value: '\u200B' });
					embMessage.edit({ embeds: [embededMessage], components: [buttons] });
					ButtonInteraction.deferUpdate();
					break;
			}
		});
	}
};

function getDefaultItems() {
	return [
		{
			name: 'Candle + Lighter',
			count: 4,
		},
		{
			name: 'Smudge Stick + Lighter',
			count: 4,
		},
		{
			name: 'Crucifix',
			count: 2,
		},
		{
			name: 'Glowstick',
			count: 2,
		},
		{
			name: 'Head Mounter Camera',
			count: 4,
		},
		{
			name: 'Motion Sensor',
			count: 4,
		},
		{
			name: 'Parabolic Microphone',
			count: 2,
		},
		{
			name: 'Salt',
			count: 2,
		},
		{
			name: 'Sanity Pills',
			count: 4,
		},
		{
			name: 'Sound Sensor',
			count: 4,
		},
		{
			name: 'Strong Flashlight',
			count: 4,
		},
		{
			name: 'Thermometer',
			count: 3,
		},
		{
			name: 'Tripod + Video Camera',
			count: 6,
		},
		{
			name: 'Spirit Box',
			count: 2,
		},
		{
			name: 'Ghost Writing Book',
			count: 2,
		},
		{
			name: 'EMF Reader',
			count: 2,
		},
		{
			name: 'UV Flashlight',
			count: 2,
		},
		{
			name: 'D.O.T.S. Projector',
			count: 2,
		}
	];
}

function getRandomItem(items) {
	items = items.filter(item => item.count !== 0)
	const elementIndex = Math.floor(Math.random() * items.length)
	return items[elementIndex].name
}

function addItemToRolledItems(itemName, itemArray, rolledItems, takeOne) {
	itemArray.find(item => {
		if (item.name === itemName) {
			if (takeOne) {
				item.count--
				rolledItems.push(item.name)
			} else {
				while(item.count > 0) {
					item.count--
					rolledItems.push(item.name)
				}
			}
		}
	})
}

function getEmbdedOutputMessage(rolledItems) {
	let sortedArray = rolledItems.map(x => x).sort()
	let tempArray = sortedArray.map(x => x).sort()

	let finishedArray = []

	while(sortedArray.length > 0) {
		tempArray = sortedArray.filter(i => i == sortedArray[0])
		sortedArray = sortedArray.filter(i => i !== tempArray[0])
		finishedArray.push(`- ${tempArray[0]} x${tempArray.length}`)
	}

	let msg = ''
	finishedArray.forEach(item => {
		msg += `${item}\n`
	})
	return msg
}