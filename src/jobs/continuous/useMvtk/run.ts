/**
 * ムビチケ使用タスク監視
 * 実際は何もしない
 * @ignore
 */

import * as kwskfs from '@motionpicture/kwskfs-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('kwskfs-jobs:continuous:settleMvtk');

kwskfs.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions).then(debug).catch(console.error);

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 200;
const taskRepository = new kwskfs.repository.Task(kwskfs.mongoose.connection);

setInterval(
    async () => {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        count += 1;

        try {
            debug('count:', count);
            await kwskfs.service.task.executeByName(
                kwskfs.factory.taskName.UseMvtk
            )({
                taskRepo: taskRepository,
                connection: kwskfs.mongoose.connection
            });
        } catch (error) {
            console.error(error.message);
        }

        count -= 1;
    },
    INTERVAL_MILLISECONDS
);
