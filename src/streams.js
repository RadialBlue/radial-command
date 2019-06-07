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
 * @event ControlMatrix#stream:selecting
 * @public
 */
/**
 * @event ControlMatrix#stream:selected
 * @public
 */
/**
 * @event ControlMatrix#stream:releasing
 * @public
 */
/**
 * @event ControlMatrix#stream:released
 * @public
 */
/**
 * @event ControlMatrix#stream:attaching
 * @public
 */
/**
 * @event ControlMatrix#stream:attached
 * @public
 */
/**
 * @event ControlMatrix#stream:detaching
 * @public
 */
/**
 * @event ControlMatrix#stream:detached
 * @public
 */

/**
 * @public
 * @class
 */
function StreamMatrix (__context, __bus) {
  const __self = this

  const MODULE_ID = 'streams'

  /** @public */
  const getStreamInfo = async (streamId, opts) => { }
  /** @public */
  const getStreamList = async (opts) => { }
  /** @public */
  const getStreamLogs = async (streamId, opts) => { }

  /** @public */
  const select = (streamId, opts) => {
    __bus.emit('stream:selecting', streamId)
    __bus.emit('stream:selected', streamId)
  }

  /** @public */
  const release = (streamId, opts) => {
    __bus.emit('stream:releasing', streamId)
    __bus.emit('stream:released', streamId)
  }

  /** @public */
  const toJSON = () => ({
    uid: MODULE_ID,
    selected: [],
    attached: [],
  })

  /** @protected */
  const attach = (stream, opts) => {
    __bus.emit('stream:attaching', stream.uid)
    __bus_emit('stream:attached', stream.uid)
  }

  /** @protected */
  const detach = (streamId, opts) => {
    __bus.emit('stream:detaching', streamId)
    __bus_emit('stream:detached', streamId)
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

module.exports = StreamMatrix