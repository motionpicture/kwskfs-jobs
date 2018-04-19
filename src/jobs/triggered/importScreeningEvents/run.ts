/**
 * 上映イベントインポート
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
    debug('connecting mongodb...');
    await kwskfs.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const eventRepository = new kwskfs.repository.Event(kwskfs.mongoose.connection);
    const placeRepository = new kwskfs.repository.Place(kwskfs.mongoose.connection);
    const organizationRepository = new kwskfs.repository.Organization(kwskfs.mongoose.connection);

    // 全劇場組織を取得
    const movieTheaters = await organizationRepository.searchMovieTheaters({});
    const importFrom = moment().toDate();
    const importThrough = moment().add(LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 'weeks').toDate();
    await Promise.all(movieTheaters.map(async (movieTheater) => {
        try {
            debug('importing screening events...');
            await kwskfs.service.masterSync.importScreeningEvents(
                movieTheater.location.branchCode,
                importFrom,
                importThrough
            )({
                event: eventRepository,
                place: placeRepository
            });
            debug('screening events imported.');
        } catch (error) {
            console.error(error);
        }
    }));

    await kwskfs.mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
