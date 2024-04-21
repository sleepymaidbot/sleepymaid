import { api } from "@/trpc/server";

const Page = async ({ params }: { readonly params: { id: string } }) => {
  const guildSettings = await api.guilds.getGuildSettings({
    guildId: params.id,
  });
  const test = JSON.stringify(guildSettings);

  return (
    <div className="container flex items-center justify-center">
      Guild id: {params.id}
      <br />
      {test}
    </div>
  );
};

export default Page;
