/**
 * 劇場インポート
 *
 * @ignore
 */

import * as kwskfs from '@motionpicture/kwskfs-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('kwskfs-jobs:*');

async function main() {
    debug('connecting mongodb...');
    await kwskfs.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const placeRepository = new kwskfs.repository.Place(kwskfs.mongoose.connection);
    const organizationRepository = new kwskfs.repository.Organization(kwskfs.mongoose.connection);

    // 全劇場組織を取得
    const movieTheaters = await organizationRepository.searchMovieTheaters({});

    await Promise.all(movieTheaters.map(async (movieTheater) => {
        try {
            debug('importing movieTheater...');
            await kwskfs.service.masterSync.importMovieTheater(movieTheater.location.branchCode)(placeRepository);
            debug('movieTheater imported');
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
