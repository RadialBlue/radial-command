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
 * @event ControlMatrix#telemetry:selecting
 * @public
 */
/**
 * @event ControlMatrix#telemetry:selected
 * @public
 */
/**
 * @event ControlMatrix#telemetry:releasing
 * @public
 */
/**
 * @event ControlMatrix#telemetry:released
 * @public
 */
/**
 * @event ControlMatrix#telemetry:attaching
 * @public
 */
/**
 * @event ControlMatrix#telemetry:attached
 * @public
 */
/**
 * @event ControlMatrix#telemetry:detaching
 * @public
 */
/**
 * @event ControlMatrix#telemetry:detached
 * @public
 */

/**
 * @public
 * @class
 */
function Telemetry (__context, __bus) {
  const __self = this

  const MODULE_ID = 'telemetry'

  /** @public */
  const getTelemetryInfo = async (telemetryId, opts) => { }
  /** @public */
  const getTelemetryList = async (opts) => { }
  /** @public */
  const getTelemetryLogs = (telemetryId, opts) => { }

  /** @public */
  const select = (telemetryId, opts) => {
    __bus.emit('telemetry:selecting', telemetryId)
    __bus.emit('telemetry:selected', telemetryId)
  }

  /** @public */
  const release = (telemetryId, opts) => {
    __bus.emit('telemetry:releasing', telemetryId)
    __bus.emit('telemetry:released', telemetryId)
  }

  /** @public */
  const toJSON = () => ({
    uid: MODULE_ID,
    selected: [],
    attached: [],
  })

  /** @protected */
  const attach = (telemetry, opts) => {
    __bus.emit('telemetry:attaching', telemetry.uid)
    __bus.emit('telemetry:attached', telemetry.uid)
  }

  /** @protected */
  const detach = (telemetryId, opts) => {
    __bus.emit('telemetry:detaching', telemetryId)
    __bus.emit('telemetry:detached', telemetryId)
  }

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

module.exports = Telemetry