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
 * @event ControlMatrix#control:selecting
 * @public
 */
/**
 * @event ControlMatrix#control:selected
 * @public
 */
/**
 * @event ControlMatrix#control:releasing
 * @public
 */
/**
 * @event ControlMatrix#control:released
 * @public
 */
/**
 * @event ControlMatrix#control:attaching
 * @public
 */
/**
 * @event ControlMatrix#control:attached
 * @public
 */
/**
 * @event ControlMatrix#control:detaching
 * @public
 */
/**
 * @event ControlMatrix#control:detached
 * @public
 */

/**
 * @public
 * @class
 */
function ControlMatrix (__context, __bus) {
  const __self = this

  const MODULE_ID = 'control'

  /** @public */
  const getControlInfo = async (controlId, opts) => { }
  /** @public */
  const getControlList = async (opts) => { }
  /** @public */
  const getControlLogs = async (controlId, opts) => { }

  /** @public */
  const select = (controlId, opts) => {
    __bus.emit('control:selecting', controlId)
    __bus.emit('control:selected', controlId)
  }

  /** @public */
  const release = (controlId, opts) => {
    __bus.emit('control:releasing', controlId)
    __bus.emit('control:released', controlId)
  }

  /** @public */
  const toJSON = () => ({
    uid: MODULE_ID,
    selected: [],
    attached: [],
  })

  /** @protected */
  const attach = (control, opts) => {
    __bus.emit('control:attaching', control.uid)
    __bus.emit('control:attached', control.uid)
  }

  /** @protected */
  const detach = (controlId, opts) => {
    __bus.emit('control:detaching', controlId)
    __bus.emit('control:detached', controlId)
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

module.exports = ControlMatrix