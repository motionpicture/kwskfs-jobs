/**
 * 確定注文返品取引監視
 * @ignore
 */

import * as kwskfs from '@motionpicture/kwskfs-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('kwskfs-jobs:*');

kwskfs.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions).then(debug).catch(console.error);

let countExecute = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 200;
const taskRepository = new kwskfs.repository.Task(kwskfs.mongoose.connection);
const transactionRepository = new kwskfs.repository.Transaction(kwskfs.mongoose.connection);

setInterval(
    async () => {
        if (countExecute > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        countExecute += 1;

        try {
            debug('exporting tasks...');
            await kwskfs.service.transaction.returnOrder.exportTasks(
                kwskfs.factory.transactionStatusType.Confirmed
            )({
                task: taskRepository,
                transaction: transactionRepository
            });
        } catch (error) {
            console.error(error.message);
        }

        countExecute -= 1;
    },
    INTERVAL_MILLISECONDS
);
