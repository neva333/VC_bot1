require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, EndBehaviorType } = require('@discordjs/voice');
const WebSocket = require('ws');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'vtrans') {
        const sourceChannel = client.channels.cache.get('1101910971578073199'); // VC1のチャンネルID

        if (sourceChannel) {
            const connection = joinVoiceChannel({
                channelId: sourceChannel.id,
                guildId: sourceChannel.guild.id,
                adapterCreator: sourceChannel.guild.voiceAdapterCreator,
            });

            const ws = new WebSocket('ws://localhost:8080');

            connection.receiver.speaking.on('start', userId => {
                const audioStream = connection.receiver.subscribe(userId, {
                    end: {
                        behavior: EndBehaviorType.Manual,
                    },
                });

                audioStream.on('data', chunk => {
                    ws.send(chunk);
                });
            });

            await interaction.reply({ content: 'VC1の音声取得を開始しました！', ephemeral: true });
        } else {
            await interaction.reply('指定されたチャンネルが見つかりません。');
        }
    } else if (commandName === 'qtrans') {
        const connection = getVoiceConnection('1101910971578073199');
        if (connection) connection.destroy();

        await interaction.reply({ content: '音声取得を停止しました！', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);