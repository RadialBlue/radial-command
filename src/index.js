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
const EventEmitter = require('events')

const { Logger } = require('../lib')
const Plugins = require('./plugins.js')

/**
 * @public
 * @class
 */
function CommandContext (__log) {
  const __self = this

  const __uid = 'radial.command'
  const __status = 'none'

  const __bus = new EventEmitter()
  const __subsystems = {}

  /** @public */
  const getSystemBus = () => __bus

  /** @public */
  const getLogger = () => __log

  /** @public */
  const getModuleList = (opts) => Object.keys(__subsystems)
  /** @public */
  const getModuleInfo = (moduleId, opts) => __subsystems[moduleId].toJSON()

  /** @public */
  const toJSON = () => ({
    uid: __uid,
    status: __status,
    systems: Object.keys(__subsystems)
        .map(subsys => __subsystems[subsys].toJSON())
  })

  /** @protected */
  const setup = async () => {
    __log.info('Configuring service.')

    __bus.on('subsystem:setup', (moduleId, module) => {
      __subsystems[moduleId] = module
    })

    await Promise.all(
      Object.keys(Plugins).map(async key => {
        const subsys = new Plugins[key](__self, __bus)
        return subsys.setup()
          .then(() => __bus.emit('subsystem:setup', subsys.uid, subsys))
      })
    )
  }

  /** @protected */
  const startup = async () => {
    __log.info('Starting up service.')
    await Promise.all(
      Object.keys(__subsystems).map(async moduleId => {
        const subsys = __subsystems[moduleId]
        __bus.emit('subsystem:starting', moduleId, subsys)
        return subsys.startup()
          .then(() => __bus.emit('subsystem:available', moduleId, subsys))
      })
    )
  }

  /** @protected */
  const shutdown = async ()  => {
    __log.info('Shutting down service.')
    await Promise.all(
      Object.keys(__subsystems).map(async moduleId => {
        const subsys = __subsystems[moduleId]
        __bus.emit('subsystem:stopping', moduleId, subsys)
        return subsys.shutdown()
          .then(() => __bus.emit('subsystem:unavailable', moduleId))
      })
    )
  }

  // Interface
  this.setup = setup.bind(this)
  this.startup = startup.bind(this)
  this.shutdown = shutdown.bind(this)

  this.getLogger = getLogger.bind(this)
  this.getSystemBus = getSystemBus.bind(this)

  this.getModuleList = getModuleList.bind(this)
  this.getModuleInfo = getModuleInfo.bind(this)

  this.toJSON = toJSON.bind(this)
}

const logger = new Logger('radial.command')
const service = new CommandContext(logger)
const bus = service.getSystemBus()

const oldEmit = bus.emit
bus.emit = function () {
  logger.info(arguments[0], JSON.stringify(Array.prototype.slice.call(arguments, 1)))
  oldEmit.apply(bus, arguments)
}

/*
bus.on('subsystem:setup', (moduleId) => {
  logger.info('  Subsystem setup:', moduleId)
})
bus.on('subsystem:starting', (moduleId) => {
  logger.info('  Subsystem starting:', moduleId)
})
bus.on('subsystem:available', (moduleId, module) => {
  logger.info('  Subsystem available:', module.uid)
})
bus.on('subsystem:stopping', (moduleId, module) => {
  logger.info('  Subsystem stopping:', moduleId)
})
bus.on('subsystem:unavailable', (moduleId) => {
  logger.info('  Subsystem unavailable:', moduleId)
})
*/

process.on('SIGINT', service.shutdown)
process.on('SIGUSR2', service.shutdown) // For nodemon

service.setup()
  .then(() => service.startup())
