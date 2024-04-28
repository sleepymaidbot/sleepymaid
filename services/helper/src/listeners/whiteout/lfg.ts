import type { ListenerInterface } from "@sleepymaid/handler";
import { type BaseInteraction } from "discord.js";

let isOnCooldown = new Map<string, boolean>();
export default class WelcomeListener implements ListenerInterface {
  public readonly name = "interactionCreate";
  public readonly once = false;

  public async execute(interaction: BaseInteraction) {
    if (!interaction.guild || interaction.guild.id !== "1150379660128047104")
      return;
    if (!interaction.isButton()) return;
    if (!interaction.inCachedGuild()) return;
    if (!interaction.customId.startsWith("whiteout:lfg:")) return;
    const roleId = interaction.customId.split(":")[2];
    if (!roleId)
      return await interaction.reply({
        content: "Something went wrong.",
        ephemeral: true,
      });
    if (isOnCooldown.get(roleId) === true)
      return await interaction.reply({
        content: "This command is on cooldown.",
        ephemeral: true,
      });
    if (!interaction.member.roles.cache.has(roleId))
      return await interaction.reply({
        content: "You need to have the role to use this command.",
        ephemeral: true,
      });
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role)
      return await interaction.reply({
        content: "Something went wrong.",
        ephemeral: true,
      });
    if (!interaction.member)
      return await interaction.reply({
        content: "Something went wrong.",
        ephemeral: true,
      });
    if (!interaction.channel)
      return await interaction.reply({
        content: "Something went wrong.",
        ephemeral: true,
      });
    return interaction.channel
      .send({
        content: `${interaction.member} is looking for Rocket League players. ${role}`,
        allowedMentions: { parse: ["roles"] },
      })
      .then(async () => {
        await interaction.reply({ content: "Message sent.", ephemeral: true });
        isOnCooldown.set(roleId, true);
        setTimeout(() => isOnCooldown.set(roleId, false), 600000);
      });
  }
}
