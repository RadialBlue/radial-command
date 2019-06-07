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
 * @event ControlMatrix#mission:selecting
 * @public
 */
/**
 * @event ControlMatrix#mission:selected
 * @public
 */
/**
 * @event ControlMatrix#mission:releasing
 * @public
 */
/**
 * @event ControlMatrix#mission:released
 * @public
 */
/**
 * @event ControlMatrix#mission:preparing
 * @public
 */
/**
 * @event ControlMatrix#mission:prepared
 * @public
 */
/**
 * @event ControlMatrix#mission:executing
 * @public
 */
/**
 * @event ControlMatrix#mission:executed
 * @public
 */
/**
 * @event ControlMatrix#mission:aborting
 * @public
 */
/**
 * @event ControlMatrix#mission:aborted
 * @public
 */
/**
 * @event ControlMatrix#mission:attaching
 * @public
 */
/**
 * @event ControlMatrix#mission:attached
 * @public
 */
/**
 * @event ControlMatrix#mission:detaching
 * @public
 */
/**
 * @event ControlMatrix#mission:detached
 * @public
 */

/**
 * @public
 * @class
 */
function MissionControl (__context, __bus) {
  const __self = this

  const MODULE_ID = 'missions'

  /** @public */
  const getMissionInfo = async (missionId, opts) => { }
  /** @public */
  const getMissionList = async (opts) => { }
  /** @public */
  const getMissionLogs = async (missionId, opts) => { }
  /** @public */
  const getMissionReport = async (missionId, opts) => { }
  /** @public */
  const getMissionTypes = async (opts) => { }

  /** @public */
  const select = (deviceId, missionId, opts) => {
    __bus.emit('mission:selecting', deviceId, missionId)
    __bus.emit('mission:selected', deviceId, missionId)
  }

  /** @public */
  const release = (deviceId, missionId, opts) => {
    __bus.emit('mission:releasing', deviceId, missionId)
    __bus.emit('mission:released', deviceId, missionId)
  }

  /** @public */
  const prepare = (deviceId, missionId, opts) => {
    __bus.emit('mission:preparing', deviceId, missionId)
    __bus.emit('mission:prepared', deviceId, missionId)
  }

  /** @public */
  const execute = (deviceId, missionId, opts) => {
    __bus.emit('mission:executing', deviceId, missionId)
    __bus.emit('mission:executed', deviceId, missionId)
  }

  /** @public */
  const abort = (deviceId, missionId, opts) => {
    __bus.emit('mission:aborting', deviceId, missionId)
    __bus.emit('mission:aborted', deviceId, missionId)
  }

  /** @public */
  const toJSON = () => ({
    uid: MODULE_ID,
    active: [],
    inactive: [],
  })

  /** @protected */
  const attach = (mission, opts) => {
    __bus.emit('mission:attaching', mission.uid)
    __bus.emit('mission:attached', mission)
  }

  /** @protected */
  const detach = (missionId, opts) => {
    __bus.emit('mission:detaching', missionId)
    __bus_emit('mission:detached', missionId)
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

module.exports = MissionControl