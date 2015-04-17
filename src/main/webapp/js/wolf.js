/**
 * wolf通信封装
 */
(function (window) {
//require用于依赖加载
    var self = {};
    //浏览器信息
    var _browser = {};
    _browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
    _browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
    _browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
    _browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
    //context上下文对象
    var _context = {
        logLevel: 3,
        version: 1,
        websocket: 'off'
    };
    self.setContext = function (config) {
        for (var name in config) {
            _context[name] = config[name];
        }
    };
    self.getContext = function (name) {
        return _context[name];
    };
    //server对象
    var _servers = {};
    //logger日志对象
    var _logger = {};
    if (_browser.mozilla || _browser.webkit) {
        _logger._loggerImpl = console;
        _logger._context = _context;
        _logger.debug = function (msg) {
            if (this._loggerImpl && this._context.logLevel >= 4) {
                this._loggerImpl.debug('DEBUG:' + msg);
            }
        };
        _logger.info = function (msg) {
            if (this._loggerImpl && this._context.logLevel >= 3) {
                this._loggerImpl.debug('INFO:' + msg);
            }
        };
        _logger.warn = function (msg) {
            if (this._loggerImpl && this._context.logLevel >= 2) {
                this._loggerImpl.debug('WARN:' + msg);
            }
        };
        _logger.error = function (msg) {
            if (this._loggerImpl && this._context.logLevel >= 1) {
                this._loggerImpl.debug('ERROR:' + msg);
            }
        };
    } else {
        _logger.debug = function (msg) {
        };
        _logger.info = function (msg) {
        };
        _logger.warn = function (msg) {
        };
        _logger.error = function (msg) {
        };
    }
    //获取消息对象
    self.getMessage = function (serverId) {
        var message;
        if (serverId && _servers[serverId]) {
            message = _servers[serverId].message;
        }
        return message;
    };
    //添加服务器
    self.addServer = function (server) {
        server.index = 0;
        //初始化消息对象
        var message = {
            _server: server,
            actions: {},
            _logger: _logger,
            listen: function (actionName, handler) {
                var action = this.actions[actionName];
                if (!action) {
                    action = {};
                    this.actions[actionName] = action;
                }
                action[handler.id] = handler;
            },
            remove: function (actionName, handlerId) {
                var action = this.actions[actionName];
                if (action) {
                    delete action[handlerId];
                }
            },
            notify: function (res) {
                //判断是否是批量消息
                if (Object.prototype.toString.apply(res) === '[object Array]') {
                    for (var index = 0; index < res.length; index++) {
                        this.notify(res[index]);
                    }
                } else {
                    //DENIED状态处理
                    if (res.act) {
                        var action = this.actions[res.act];
                        if (action) {
                            var handler;
                            for (var name in action) {
                                handler = action[name];
                                handler.callback(res);
                            }
                        }
                    } else {
                        if (res.wolf) {
                            if (res.wolf === 'TIME') {
                                //TODO
                            } else if (res.wolf === 'SHUTDOWN') {
                                //TODO
                            }
                        }
                    }
                }
            }
        };
        //判断是否采用websocket通信
        if (_context.websocket && _context.websocket === 'on' && (window.MozWebSocket || window.WebSocket)) {
            var Socket = "MozWebSocket" in window ? MozWebSocket : WebSocket;
            //初始化websocket
            message._websocket = null;
            message.send = function (msg) {
                var that = this;
                //sid
                msg.sid = that._server.sid;
                //构造json，对特殊字符转义
                var value;
                var ch;
                var chType;
                var msgText = '{';
                for (var name in msg) {
                    value = msg[name];
                    chType = Object.prototype.toString.apply(value);
                    if (chType === '[object String]') {
                        msgText += '"' + name + '":"';
                        for (var index = 0; index < value.length; index++) {
                            ch = value.charAt(index);
                            switch (ch) {
                                case '"':
                                    msgText += '\\"';
                                    break;
                                case '\\':
                                    msgText += '\\\\';
                                    break;
                                case '\b':
                                    msgText += '\\b';
                                    break;
                                case '\n':
                                    msgText += '\\n';
                                    break;
                                case '/':
                                    msgText += '\\/';
                                    break;
                                case '\f':
                                    msgText += '\\f';
                                    break;
                                case '\r':
                                    msgText += '\\r';
                                    break;
                                case '\t':
                                    msgText += '\\t';
                                    break;
                                default:
                                    msgText += ch;
                            }
                        }
                        msgText += '",';
                    } else if (chType === '[object Number]') {
                        msgText += '"' + name + '":"' + value + '",';
                    }
                }
                msgText = msgText.substr(0, msgText.length - 1);
                msgText += '}';
                var websocket = that._websocket;
                if (websocket && websocket.readyState === 1) {
                    websocket.send(msgText);
                    websocket._logger.info(that._server.id + '-' + websocket.id + ':sendMessage:' + msgText);
                } else {
                    websocket = new Socket(server.websocketUrl);
                    websocket._server = server;
                    websocket._logger = _logger;
                    server.index++;
                    websocket.id = server.index;
                    websocket.onopen = function (event) {
                        this._logger.info(this._server.id + '-' + this.id + ':connect:' + this._server.websocketUrl);
                        this.send(msgText);
                        this._logger.info(this._server.id + '-' + this.id + ':sendMessage:' + msgText);
                    };
                    websocket.onmessage = function (event) {
                        this._logger.info(this._server.id + '-' + this.id + ':onMessage:' + event.data);
                        var res = eval('(' + event.data + ')');
                        if (res.sid) {
                            this._server.sid = res.sid;
                            //保持
                            this._logger.info(this._server.id + '-' + this.id + ':hold:' + res.sid);
                            this._server.message._websocket = this;
                        }
                        try {
                            that.notify(res);
                        } catch (e) {
                            this._logger.error(this._server.id + '-' + this.id + ':error:' + e);
                        }
                    };
                    websocket.onclose = function (event) {
                        this._logger.info(this._server.id + '-' + this.id + ':close:' + this._server);
                    };
                    websocket.onerror = function (event) {
                        this._logger.info(this._server.id + '-' + this.id + ':error:' + this._server);
                    };
                }
            };
            //websocket不需要comet推送
            message.startComet = function () {
            };
        } else {
            message.send = function (msg, callback) {
                var that = this;
                msg.sid = that._server.sid;
                var httpUrl = that._server.httpUrl+ msg.route + '?callback=?';
                delete msg.route;
                $.getJSON(httpUrl, msg, function (res) {
                    if (res.sid) {
                        that._server.sid = res.sid;
                    }
                    if(callback) {
                        callback(res);
                    }
                    that.notify(res);
                });
            };
            message.startComet = function () {
                if (this._server.sid) {
                    var push = {
                        'httpUrl': this._server.httpUrl,
                        'sid': this._server.sid,
                        getPushMessage: function () {
                            var that = this;
                            $.getJSON(that.httpUrl + '?callback=?', {wolf: 'PUSH', sid: that.sid}, function (res) {
                                //PUSH STOP
                                if (res.wolf) {
                                    if (res.wolf === 'PUSH_TIMEOUT') {
                                        that.getPushMessage();
                                    }
                                } else {
                                    that.notify(res);
                                    //
                                    that.getPushMessage();
                                }
                            });
                        }
                    };
                    //执行
                    push.getPushMessage();
                }
            };
        }
        server.message = message;
        //保存server
        _servers[server.id] = server;
    };
    window.Wolf = self;
    return self;
})(window);