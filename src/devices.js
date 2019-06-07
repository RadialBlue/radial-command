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
 * @event ControlMatrix#device:attaching
 * @public
 */
/**
 * @event ControlMatrix#device:attached
 * @public
 */
/**
 * @event ControlMatrix#device:detaching
 * @public
 */
/**
 * @event ControlMatrix#device:detached
 * @public
 */

/**
 * @public
 * @class
 */
function DeviceRegistry (__ctx, __bus) {
  const __self = this
  const __log = __ctx.getLogger()

  const MODULE_ID = 'devices'

  const __devices = {}

  /** @public */
  const getDeviceInfo = (deviceId, opts) => { }
  /** @public */
  const getDeviceList = (opts) => { }
  /** @public */
  const getDeviceLogs = (deviceId, opts) => { }

  /** @public */
  const toJSON = () => ({
    uid: MODULE_ID,
    attached: Object.keys(__devices),
    detached: [],
  })

  /** @protected */
  const attach = (device, opts) => {
    const path = opts.connection.uid +'/'+ device.type
    __bus.emit('device:attaching', path)

    device.path = path

    if (opts.connection) {
      opts.connection.on('disconnect', () => detach(device.path))
    }

    __devices[device.path] = device
    __bus.emit('device:attached', device)
    return device.path
  }

  /** @protected */
  const detach = (path, opts) => {
    __bus.emit('device:detaching', path)
    delete __devices[path]
    __bus.emit('device:detached', path)
  }

  /** @protected */
  const update = (path, props, opts) => {
    if (!(path in __devices)) return ''

    __bus.emit('device:updating', path)
    // XXX - Create events.
    __devices[path] = Object.assign(__devices[path], props)
    __bus.emit('device:updated', path, props)
  }

  /**
   * Setup system event listeners for gateway service availability changes
   * Attach gateway connection command listeners when available, remove when
   * going offline.
   * @protected
   * @method Connection#setup
   */
  const setup = async () => {
    __bus.on('subsystem:available', (id, gw) => {
      if (id !== 'gateway') return

      __log.info('Gateway available, registring commands.')
      gw.commands().attach(MODULE_ID, (connection, mesg) => {
        if (mesg.name === 'device:attach')
          return async (connection, mesg) =>
              attach(
                mesg.device,
                Object.assign(mesg.options || {}, { connection })
              )
        if (mesg.name === 'device:detach')
          return async (connection, mesg) =>
              detach(
                mesg.path,
                Object.assign(mesg.options || {}, { connection })
              )
        if (mesg.name === 'device:update')
          return async (connection, mesg) =>
              update(
                mesg.path, mesg.properties,
                Object.assign(mesg.options || {}, { connection })
              )
      })
    })

    __bus.on('subsystem:stopping', (id, gw) => {
      if (id !== 'gateway') return

      __log.info('Gateway stopping, removing command registrations.')
      gw.commands().detach(MODULE_ID)
    })
  }

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

module.exports = DeviceRegistry