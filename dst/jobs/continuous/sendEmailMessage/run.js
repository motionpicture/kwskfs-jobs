"use strict";
/**
 * Eメールメッセージ送信タスク監視
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const kwskfs = require("@motionpicture/kwskfs-domain");
const createDebug = require("debug");
const mongooseConnectionOptions_1 = require("../../../mongooseConnectionOptions");
const debug = createDebug('kwskfs-jobs:*');
kwskfs.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default).then(debug).catch(console.error);
let count = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 200;
const taskRepo = new kwskfs.repository.Task(kwskfs.mongoose.connection);
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
        return;
    }
    count += 1;
    try {
        yield kwskfs.service.task.executeByName(kwskfs.factory.taskName.SendEmailMessage)({
            taskRepo: taskRepo,
            connection: kwskfs.mongoose.connection
        });
    }
    catch (error) {
        console.error(error.message);
    }
    count -= 1;
}), INTERVAL_MILLISECONDS);
