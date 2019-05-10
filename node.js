const Discord = require('discord.js');
const client = new Discord.Client();
const messageID = "576473282136637440";
const channelID = "575982744711069696";
const nouveauID = 'Nouveau arrivant';
const confirmeID = 'arrivant Confirmé';
const log_channel = "576009033396518932";

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
        var confirme = reaction.message.guild.roles.find(r => r.name === confirmeID);
        
        const message_embed = new Discord.RichEmbed()
        .setColor('#00ff00')
        .setAuthor(member.user.tag,member.user.avatarURL)
        .setTimestamp()
        .setThumbnail(member.user.avatarURL)
        .addField('Utilisateur', member.user.username + " - " +member.user.toString(), inline=true)
        .addField('UserID', member.id, inline=true)
        .addField('Action', 'A accepté le CGU', inline=false)
        reaction.remove(user).then(reaction => {
            member.removeRole(nouveau).then(()=>{
                member.addRole(confirme).then(()=>{
                    
                    client.channels.get(log_channel).send(message_embed);
                });
            })
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
                    member.send("Vous n'avez pas accepté le réglement !").then(()=>{
                        member.kick("No respect CGU").then(()=>{
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