import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { type Client, type ActivityOptions, Events, ActivityType } from 'discord.js';
import { BotStatusCycle, ExperienceUniverseID } from '#/lib/types/enums';
import { ClassicGamesApi } from 'openblox/classic';

@ApplyOptions<Listener.Options>({
	event: Events.ClientReady,
	once: true
})
export class BotStatus extends Listener {
    private activity: ActivityOptions = { type: ActivityType.Custom, name: '' };
    private currentStatus: BotStatusCycle = BotStatusCycle.UntitledProjectPlaying;

    private async fetchPlayers(universeId: ExperienceUniverseID) {
        const { data } = await ClassicGamesApi.universesInfo({ universeIds: [ universeId ] });
        if (!data[universeId]) return null;

        return data[universeId].playing;
    }

    public async statusRun(client: Client) {
        switch (this.currentStatus) {
            case BotStatusCycle.UntitledProjectPlaying:
//                this.currentStatus = BotStatusCycle.VoxelBlockBuilderPlaying;
                
                const oaklandsPlayers = await this.fetchPlayers(ExperienceUniverseID.Untitled_Project);
                if (!oaklandsPlayers) break;

                this.activity.name = `Oaklands・${oaklandsPlayers} playing`;

                break;
        }

        if (client.user?.presence.activities[0]?.name !== this.activity.name) {
            client.user?.setActivity(this.activity);
        }

        return new Promise((res) => {
            setTimeout(async () => {
                res(await this.statusRun(client));
            }, 10 * 1000);
        });
    }

    public override async run(client: Client) {
        await this.statusRun(client);
    }
}