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
function CommandAlerts (__ctx, __bus) {
  const __self = this

  const MODULE_ID = 'alerts'

  /** @public */
  const toJSON = () => ({
    uid: MODULE_ID,
    active: [],
    inactive: [],
  })

  /** @protected */
  const setup = async () => { }
  /** @protected */
  const startup = async () => { }
  /** @protected */
  const shutdown = async () => { }

  // Interface
  this.uid = MODULE_ID
  this.setup = setup.bind(this)
  this.startup = startup.bind(this)
  this.shutdown = shutdown.bind(this)
  this.toJSON = toJSON.bind(this)
}

module.exports = CommandAlerts
