const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { OpenAI, toFile } = require('openai');
const config = require('../config.js');

const MODEL = 'gpt-image-1';
const IMAGE_SIZE = '1024x1024';

async function fetchImageAsFile(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch image (${response.status})`);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const extension = contentType.includes('jpeg') || contentType.includes('jpg')
        ? 'jpg'
        : contentType.includes('webp')
            ? 'webp'
            : 'png';
    const buffer = Buffer.from(await response.arrayBuffer());

    return toFile(buffer, `image.${extension}`, { type: contentType });
}

function getGeneratedImageBuffer(imageData) {
    if (imageData.b64_json) {
        return Buffer.from(imageData.b64_json, 'base64');
    }

    throw new Error('Image API did not return image data');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Generate or edit an image with AI')
        .addStringOption(option =>
            option
                .setName('prompt')
                .setDescription('Describe the image to generate or how to edit an image')
                .setRequired(false))
        .addAttachmentOption(option =>
            option
                .setName('image')
                .setDescription('Image to edit')
                .setRequired(false)),
    async execute(interaction) {
        if (!config.OPENAI_API_KEY) {
            return interaction.reply({
                content: 'AI is not configured. Add OPENAI_API_KEY to your environment.',
                ephemeral: true,
            });
        }

        const prompt = interaction.options.getString('prompt');
        const imageAttachment = interaction.options.getAttachment('image');

        if (!prompt && !imageAttachment) {
            return interaction.reply({
                content: 'Provide a prompt, an image attachment, or both.',
                ephemeral: true,
            });
        }

        if (imageAttachment && !prompt) {
            return interaction.reply({
                content: 'When using an image, also provide a prompt describing how to edit it.',
                ephemeral: true,
            });
        }

        if (imageAttachment && !imageAttachment.contentType?.startsWith('image/')) {
            return interaction.reply({
                content: 'The attachment must be an image file.',
                ephemeral: true,
            });
        }

        const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

        await interaction.deferReply();

        try {
            let response;

            if (imageAttachment) {
                const imageFile = await fetchImageAsFile(imageAttachment.url);
                response = await openai.images.edit({
                    model: MODEL,
                    image: imageFile,
                    prompt,
                    size: IMAGE_SIZE,
                    n: 1,
                });
            } else {
                response = await openai.images.generate({
                    model: MODEL,
                    prompt,
                    size: IMAGE_SIZE,
                    n: 1,
                });
            }

            const generatedImage = response.data?.[0];

            if (!generatedImage) {
                return interaction.editReply('The AI returned an empty response.');
            }

            const imageBuffer = getGeneratedImageBuffer(generatedImage);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'generated.png' });
            const content = imageAttachment
                ? `Prompt: ${prompt}\nSource: ${imageAttachment.name}`
                : `Prompt: ${prompt}`;

            await interaction.editReply({
                content,
                files: [attachment],
            });
        } catch (err) {
            console.error('image command failed:', err);
            await interaction.editReply('Something went wrong generating the image.');
        }
    },
};
