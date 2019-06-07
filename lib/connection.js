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

/**
 * @event Connection#event
 * @public
 */

/**
 * Manages request/response handling of Radial network connections for
 * Radial.Command service and clients.
 * 
 * @public
 * @class
 * 
 * @param {Socket} socket Underlying transport handle
 */
function Connection (__socket) {
  EventEmitter.call(this)

  const __self = this

  let __sequence = 0
  const __waiting = {}

  const __listeners = []

  /**
   * @public
   * @method Connection#addEventListener
   * 
   * @param {Function} listener Function that returns another function if mesg is matched.
   * 
   */
  const addMessageListener = (listener) => {
    __listeners.push(listener)
  }

  /**
   * Sends an Event message through this connection.
   * @public
   * @method Connection#event
   * 
   * @param {string} name Event name
   * @param {*} params Event parameters
   */
  const event = (name, params) => {
    const mesg = { type: 'event', name, params }
    __socket.send(JSON.stringify(mesg))
    if (process.env.COMMS_DEBUG) console.info('<<', mesg)
  }

  /**
   * Sends a Request message through this connection and waits for response.
   * @public
   * @method Connection#message
   * 
   * @param {string} name Message name
   * @param {*} params Message parameters
   * 
   * @returns {Promise} Resolves when response received, rejects on error.
   */
  const message = (name, params) => new Promise((resolve, reject) => {
    const mesg = { type: 'message', seq: __sequence++, name, params }
    __waiting[mesg.seq] = [ resolve, reject ]
    __socket.send(JSON.stringify(mesg))
    if (process.env.COMMS_DEBUG) console.info('<<', mesg)
  })

  /**
   * Closes the underlying transport and disassociates this connection from it.
   * @public
   * @method Connection#close
   */
  const close = () => {
    __socket.close()
    if (process.env.COMMS_DEBUG) console.info('SOCKET CLOSED')
  }

  /**
   * Called when an incoming message is received from the underlying transport.
   * Handles dispatching the message to appropriate handlers depending on conditions,
   * propogates received events through instances EventEmitter interface.
   * @private
   * @param {Object} mesg JSON message
   */
  const onIncomingMessage = (mesg) => {
    mesg = JSON.parse(mesg)

    if (process.env.COMMS_DEBUG) console.info('>>', mesg)

    if (mesg.type === 'event') {
      console.info('Event received:', mesg)
      __self.emit('event', __self, mesg.name, mesg.params)
      return
    }

    if (mesg.type === 'message') {
      let candidate
      for (let i = 0; i < __listeners.length; i++) {
        const listener = __listeners[i]
        if (listener.match) {
          candidate = __listeners[i].match(__self, mesg)
        } else {
          candidate = __listeners[i](__self, mesg)
        }

        if (candidate) break
      }

      if (!candidate) {
        console.warn('No message handler found for:', mesg)
        return
      }

      candidate(__self, mesg.params)
        .then(result => {
          const response = { type: 'response', name: mesg.name, seq: mesg.seq, result }
          __socket.send(JSON.stringify(response))
          if (process.env.COMMS_DEBUG) console.info('<<', response)
        })
        .catch(error => {
          console.warn(error)
          const response = { type: 'response', name: mesg.name, seq: mesg.seq, error }
          __socket.send(JSON.stringify(response))
          if (process.env.COMMS_DEBUG) console.info('<<', response)
        })
      return
    }

    if (mesg.type === 'response' && mesg.seq in __waiting) {
      const [ resolve, reject ] = __waiting[mesg.seq]
      delete __waiting[mesg.seq]

      if (mesg.error) return reject(mesg.error)

      resolve(mesg.result)
      return
    }

    console.info('Unrecognised message format:', mesg)
  }

  __socket.on('message', onIncomingMessage)
  __socket.on('close', () => __self.emit('disconnect'))

  // Interface
  this.addMessageListener = addMessageListener.bind(this)

  this.event = event.bind(this)
  this.message = message.bind(this)
  this.close = close.bind(this)

  /**
   * @public
   * @method Connection#toJSON
   */
  this.toJSON = function () {
    return {
      uid: this.uid,
      type: this.type,
      persist: this.persist,
    }
  }.bind(this)
}
Connection.prototype = Object.create(EventEmitter.prototype)

module.exports = Connection