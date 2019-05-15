const Discord = require('discord.js');
const client = new Discord.Client();
const messageID = "578223948307759154";
const channelID = "578220755465011201";
const nouveauID = 'Nouveau Membre';
const log_channel = "436970167633707008";

client.once('ready', () => {
    console.log('Ready!');
});

const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

client.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(channelID) || await user.createDM();
    if (channel.messages.has(messageID)) return;

    const message = await channel.fetchMessage(messageID);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);

    if (!reaction) {
        const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
        reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }
    client.emit(events[event.t], reaction, user);
});

client.on('messageReactionAdd', (reaction, user) => {

    if (reaction.emoji.name == "✅") {
        var member = reaction.message.guild.members.find(member => member.id === user.id)
        var nouveau = reaction.message.guild.roles.find(r => r.name === nouveauID);
        
        const message_embed = new Discord.RichEmbed()
        .setColor('#00ff00')
        .setAuthor(member.user.tag,member.user.avatarURL)
        .setTimestamp()
        .setThumbnail(member.user.avatarURL)
        .addField('Utilisateur', member.user.username + " - " +member.user.toString(), inline=true)
        .addField('UserID', member.id, inline=true)
        .addField('Action', 'A accepté le CGU', inline=false)
        reaction.remove(user).then(reaction => {
            member.removeRole(nouveau);
        });
    }
    if (reaction.emoji.name == "❌") {
        var member = reaction.message.guild.members.find(member => member.id === user.id)
        const message_remove = new Discord.RichEmbed()
        .setColor('#ff0000')
        .setAuthor(member.user.tag,member.user.avatarURL)
        .setTimestamp()
        .setThumbnail(member.user.avatarURL)
        .addField('Utilisateur', member.user.username + " - " +member.user.toString(), inline=true)
        .addField('UserID', member.id, inline=true)
        .addField('Action', 'a refusé le CGU', inline=false)
        reaction.remove(user).then(reaction => {
            if(member.bannable == true){
                client.channels.get(log_channel).send(message_remove).then(()=>{
                    member.send("Malheureusement vous n'avez pas accepter le règlement et par conséquent vous ne pouvais pas devenir membre du Discord Metin2.fr").then(()=>{
                        member.kick("Malheureusement vous n'avez pas accepter le règlement et par conséquent vous ne pouvais pas devenir membre du Discord Metin2.fr").then(()=>{
                        }).catch(err=>console.log);
                    });
                });
            }
            else{
                
            }
        });

    }
});

client.login(process.env.TOKEN);