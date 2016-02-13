import httpStatus from 'http-status';
import chai from 'chai';
import { expect } from 'chai';
import testFunc from '../src/index'
import assert from 'assert'

describe('# Testing tests :)', function() {
    it('should return 1', function () {
       assert.equal(testFunc(), 1);
    });
});