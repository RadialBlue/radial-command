/*
 * Copyright 2017-2019 Tom Swindell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */

function Commands () {
  const __listeners = {}

  this.attach = (uid, listener) => {
    __listeners[uid] = listener
  }

  this.detach = (uid) => {
    delete __listeners[uid]
  }

  this.match = (command, mesg) => {
    const uids = Object.keys(__listeners)

    for (let i = 0; i < uids.length; i++) {
      const candidate = __listeners[uids[i]](command, mesg)
      if (candidate) return candidate
    }

    return null
  }
}

module.exports = Commands