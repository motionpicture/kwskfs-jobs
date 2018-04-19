/**
 * 映画作品インポート
 *
 * @ignore
 */

import * as kwskfs from '@motionpicture/kwskfs-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('kwskfs-jobs:*');

export async function main() {
    debug('connecting mongodb...');
    await kwskfs.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const creativeWorkRepository = new kwskfs.repository.CreativeWork(kwskfs.mongoose.connection);
    const organizationRepository = new kwskfs.repository.Organization(kwskfs.mongoose.connection);

    // 全劇場組織を取得
    const movieTheaters = await organizationRepository.searchMovieTheaters({});

    // 劇場ごとに映画作品をインポート
    await Promise.all(movieTheaters.map(async (movieTheater) => {
        try {
            debug('importing movies...', movieTheater);
            await kwskfs.service.masterSync.importMovies(movieTheater.location.branchCode)({ creativeWork: creativeWorkRepository });
            debug('movies imported');
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
