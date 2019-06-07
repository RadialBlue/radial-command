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

 /**
  * @public
  * @class
  */
function Logger (__uid) {
  const __filepath = __uid

  console.info('Logging started at:', new Date())

  const log = function (type) {
    console[type].apply(null, [
      new Date().toISOString() + ' -- ' + type.toUpperCase() + ' --'
    ].concat(Array.prototype.slice.call(arguments, 1)))
  }

  /** @public */
  const info = function () { log.apply(null, ['info'].concat(Array.prototype.slice.call(arguments))) }
  /** @public */
  const warn = function () { log.apply(null, ['warn'].concat(Array.prototype.slice.call(arguments))) }
  /** @public */
  const error = function () { log.apply(null, ['error'].concat(Array.prototype.slice.call(arguments))) }

  this.info = info.bind(this)
  this.warn = warn.bind(this)
  this.error = error.bind(this)
}

module.exports = Logger