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
const { promisify } = require('util')

const fs = require('fs')
const path = require('path')

const https = require('https')

const express = require('express')
const WebSocket = require('ws')
  
const { Commands, Connection } = require('../lib/')

/**
 * @public
 * @class
 */
function CommandGateway (__ctx, __bus) {
  const __self = this
  const __log = __ctx.getLogger()

  const MODULE_ID = 'gateway'

  let __connection_seq = 0
  const __connections = {}
  const __subscriptions = {}

  let __cmds

  let __app
  let __server
  let __ws

  /** @public */
  const getConnectionList = (opts) => {
    return Object.keys(__connections)
  }
  /** @public */
  const getConnectionInfo = (uid, opts) => {
    return __connections[uid].toJSON()
  }

  /** @public */
  const toJSON = (opts) => ({
    uid: MODULE_ID,
    connections: getConnectionList(),
  })

  /** @protected */
  const attach = (connection, opts) => {
    const uid = '/connections/' + __connection_seq++
    __bus.emit('connection:attaching', uid)

    connection.uid = uid
    connection.type = opts.type || 'unknown'
    connection.persist = opts.persist || false

    connection.on('disconnect', () => detach(uid))

    __connections[uid] = connection
    __bus.emit('connection:attached', connection)
  }

  /** @protected */
  const detach = async (uid) => {
    const connection = __connections[uid]
    if (!connection) return

    __bus.emit('connection:detaching', connection)

    // Automatically unsubscribe all registered subscriptions.
    if(connection.subscriptions) {
      connection.subscriptions.forEach(sub => {
        const i = __subscriptions[sub].findIndex(iter => iter.uid === connection.uid)
        __subscriptions[sub].splice(i, 1)
      })
    }

    // Disconnect and remove connection handle.
    connection.close()
    delete __connections[uid]
    __bus.emit('connection:detached', uid)
  }

  /** @protected */
  const subscribe = async (connection, mesg) => {
    if (!(mesg.event in __subscriptions)) {
      __subscriptions[mesg.event] = []
    }
    __subscriptions[mesg.event].push(connection)

    // XXX - Implement subscription support in lib/Connection.js
    if (!connection.subscriptions) {
      connection.subscriptions = []
      connection.subscriptions.push(mesg.event)
    }

    return true
  }

  /** @protected */
  const unsubscribe = async (connection, mesg) => {
    return 'NOT_IMPLEMENTED_YET'
  }

  /** @protected */
  const setup = async () => {
    // Setup Command Processor
    __cmds = new Commands()

    // Add subscription messages.
    __cmds.attach('gateway', (connection, mesg) => {
        if (mesg.name === 'gateway:subscribe')
          return async (connection, mesg) => subscribe(connection, mesg)

        if (mesg.name === 'gateway:unsubscribe')
          return async (connection, mesg) => unsubscribe(connection, mesg)

        if (mesg.name === 'gateway:detach')
          return async (connection, mesg) => detach(connection.uid)
    })

    // Setup HTTP / Socket.io Service
    __app = express()
    __app.use(require('body-parser').json())

    __server = https.createServer({
      key: fs.readFileSync(path.join(__dirname, '../private.key')),
      cert: fs.readFileSync(path.join(__dirname, '../certificate.crt')),
    }, __app)

    // Document root responder
    __app.get('/', (req, res) => res.status(200).json(__ctx.toJSON()))

    // Dynamically generate HTTP GET responders for each modules toJSON()
    // method.
    __bus.on('subsystem:available', (id, sys) => {
      __app.get('/'+id, (req, res) => res.status(200).json(sys.toJSON()))
    })

    // Setup WebSocket service handlers
    __ws = new WebSocket.Server({ server: __server })

    // Override __bus.emit to implementation to proxy subscribed events
    // to registered connections.
    const oldEmit = __bus.emit
    __bus.emit = function () {
      const name = arguments[0]
      const args = Array.prototype.slice.call(arguments, 1)
      if (name in __subscriptions) {
        __subscriptions[name].forEach(ctx => {
          ctx.event.apply(ctx, arguments)
        })
      }
      oldEmit.apply(__bus, arguments)
    }
  }

  /** @protected */
  const startup = async () => {
    // Attach new WebSocket connection process.
    __ws.on('connection', socket => {
      __log.info('Attaching gateway client transport:', socket.id)

      // Accept new connections
      const connection = new Connection(socket)
      connection.addMessageListener((connection, mesg) => {
        if (mesg.name === 'gateway:attach')
          return async (connection, mesg) => {
            attach(connection, mesg)
            connection.addMessageListener(__cmds)
            return true
          }
      })
    })

    // Start listening
    // XXX - Make address/port configurable.
    __server.listen(9200, () => {
      __log.info('Listening on 0.0.0.0:9200')
    })
  }

  /** @protected */
  const shutdown = async () => {
    // Detach all current connections.
    Object.keys(__connections).forEach(cId => detach(cId))

    // Close socket and HTTP service listeners.
    await promisify(__ws.close.bind(__ws))()
    await __server.close()
  }

  // Interface
  this.uid = MODULE_ID
  this.setup = setup.bind(this)
  this.startup = startup.bind(this)
  this.shutdown = shutdown.bind(this)
  this.toJSON = toJSON.bind(this)

  this.commands = () => __cmds
}

module.exports = CommandGateway
