"use strict";
/**
 * 上映イベントインポート
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
const moment = require("moment");
const mongooseConnectionOptions_1 = require("../../../mongooseConnectionOptions");
const debug = createDebug('kwskfs-jobs:*');
/**
 * 上映イベントを何週間後までインポートするか
 * @const {number}
 */
const LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS = (process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS !== undefined)
    // tslint:disable-next-line:no-magic-numbers
    ? parseInt(process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 10)
    : 1;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        debug('connecting mongodb...');
        yield kwskfs.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
        const eventRepository = new kwskfs.repository.Event(kwskfs.mongoose.connection);
        const placeRepository = new kwskfs.repository.Place(kwskfs.mongoose.connection);
        const organizationRepository = new kwskfs.repository.Organization(kwskfs.mongoose.connection);
        // 全劇場組織を取得
        const movieTheaters = yield organizationRepository.searchMovieTheaters({});
        const importFrom = moment().toDate();
        const importThrough = moment().add(LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 'weeks').toDate();
        yield Promise.all(movieTheaters.map((movieTheater) => __awaiter(this, void 0, void 0, function* () {
            try {
                debug('importing screening events...');
                yield kwskfs.service.masterSync.importScreeningEvents(movieTheater.location.branchCode, importFrom, importThrough)({
                    event: eventRepository,
                    place: placeRepository
                });
                debug('screening events imported.');
            }
            catch (error) {
                console.error(error);
            }
        })));
        yield kwskfs.mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
