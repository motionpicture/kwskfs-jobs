/**
 * mongoose接続オプションテスト
 * @ignore
 */

import * as assert from 'power-assert';

import mongooseConnectionOptions from './mongooseConnectionOptions';

describe('mongooseConnectionOptions', () => {
    it('接続オプションはオブジェクトなはず', () => {
        assert.equal(typeof mongooseConnectionOptions, 'object');
    });
});
