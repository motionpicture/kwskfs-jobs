/**
 * パフォーマンス空席状況を更新する
 * COA空席情報から空席状況を生成してredisに保管する
 * @ignore
 */

import * as kwskfs from '@motionpicture/kwskfs-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('kwskfs-jobs:*');

/**
 * 上映イベントを何週間後までインポートするか
 * @const {number}
 */
const LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS = (process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS !== undefined)
    // tslint:disable-next-line:no-magic-numbers
    ? parseInt(process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 10)
    : 1;

async function main() {
    await kwskfs.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const redisClient = kwskfs.redis.createClient({
        host: <string>process.env.ITEM_AVAILABILITY_REDIS_HOST,
        // tslint:disable-next-line:no-magic-numbers
        port: parseInt(<string>process.env.ITEM_AVAILABILITY_REDIS_PORT, 10),
        password: <string>process.env.ITEM_AVAILABILITY_REDIS_KEY,
        tls: { servername: <string>process.env.ITEM_AVAILABILITY_REDIS_HOST }
    });

    const itemAvailabilityRepository = new kwskfs.repository.itemAvailability.IndividualScreeningEvent(redisClient);
    const organizationRepository = new kwskfs.repository.Organization(kwskfs.mongoose.connection);

    // update by branchCode
    const movieTheaters = await organizationRepository.searchMovieTheaters({});
    const startFrom = moment().toDate();
    const startThrough = moment().add(LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 'weeks').toDate();
    await Promise.all(movieTheaters.map(async (movieTheater) => {
        try {
            debug('updating item availability...branchCode:', movieTheater.location.branchCode, startFrom, startThrough);
            await kwskfs.service.itemAvailability.updateIndividualScreeningEvents(
                movieTheater.location.branchCode,
                startFrom,
                startThrough
            )({ itemAvailability: itemAvailabilityRepository });
            debug('item availability updated');
        } catch (error) {
            console.error(error);
        }
    }));

    redisClient.quit();
    await kwskfs.mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
