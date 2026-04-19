const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "ping",
    alias: ["speed", "pong"],
    react: "🌡️",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {

    const start = Date.now();

    const reactionEmojis = ['🍧', '🏓', '🎯', '💨', '🍸'];
    const textEmojis = ['🎲', '🎀', '⚡️', '🏓', '🥃', '🍷'];

    let reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
    let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    
    await conn.sendMessage(from, { react: { text: textEmoji, key: mek.key } });

    const responseTime = Date.now() - start;

    await conn.sendMessage(from, {
        text: `*IMTIYAZ-RAJPUT SPEED: ${responseTime}ms ${reactionEmoji}*`,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363358503834174@newsletter',
                newsletterName: "IMTIYAZ-RAJPUT",
                serverMessageId: 143
            }
        }
    }, { quoted: mek });

});

cmd({
    pattern: "ping2",
    react: "🍂",
    filename: __filename
}, async (conn, mek, m, { from }) => {

    const start = Date.now();
    const msg = await conn.sendMessage(from, { text: '*PINGING...*' }); 
    const ping = Date.now() - start;

    await conn.sendMessage(from, {
        text: `*IMTIYAZ-RAJPUT SPEED: ${ping}ms*`
    }, { quoted: msg });

});
