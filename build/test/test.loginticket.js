"use strict";
/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var loginticket_1 = require("../src/auth/loginticket");
it('should return null userId even if no payload', function () {
    var ticket = new loginticket_1.LoginTicket();
    assert.equal(ticket.getUserId(), null);
});
it('should return envelope', function () {
    var ticket = new loginticket_1.LoginTicket('myenvelope');
    assert.equal(ticket.getEnvelope(), 'myenvelope');
});
it('should return attributes from getAttributes', function () {
    var payload = { aud: 'aud', sub: 'sub', iss: 'iss', iat: 1514162443, exp: 1514166043 };
    var ticket = new loginticket_1.LoginTicket('myenvelope', payload);
    assert.deepEqual(ticket.getAttributes(), { envelope: 'myenvelope', payload: payload });
});
//# sourceMappingURL=test.loginticket.js.map