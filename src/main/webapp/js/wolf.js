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
        websocket: 'on'
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
                    if (res.route) {
                        var action = this.actions[res.route];
                        if (action) {
                            var handler;
                            for (var id in action) {
                                handler = action[id];
                                if (id.substr(0, 3) === 'auto') {
                                    delete action[id];
                                }
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
            message._callbackId = 0;
            message.send = function (route, param, callback) {
                var that = this;
                if (callback) {
                    that._callbackId++;
                }
                that.listen(route, {id: 'auto-' + that._callbackId, callback: callback});
                //构造json，对特殊字符转义
                var value;
                var ch;
                var chType;
                var paramText = '{';
                for (var name in param) {
                    value = param[name];
                    chType = Object.prototype.toString.apply(value);
                    if (chType === '[object String]') {
                        paramText += '"' + name + '":"';
                        for (var index = 0; index < value.length; index++) {
                            ch = value.charAt(index);
                            switch (ch) {
                                case '"':
                                    paramText += '\\"';
                                    break;
                                case '\\':
                                    paramText += '\\\\';
                                    break;
                                case '\b':
                                    paramText += '\\b';
                                    break;
                                case '\n':
                                    paramText += '\\n';
                                    break;
                                case '\f':
                                    paramText += '\\f';
                                    break;
                                case '\r':
                                    paramText += '\\r';
                                    break;
                                case '\t':
                                    paramText += '\\t';
                                    break;
                                default:
                                    paramText += ch;
                            }
                        }
                        paramText += '",';
                    } else if (chType === '[object Number]') {
                        paramText += '"' + name + '":"' + value + '",';
                    }
                }
                if(paramText.length > 1) {
                    paramText = paramText.substr(0, paramText.length - 1);
                }
                paramText += '}';
                var msgText = '{"route":"' + route + '","param":' + paramText + '}';
                var websocket = that._websocket;
                if (websocket && websocket.readyState === 1) {
                    websocket.send(msgText);
                    websocket._logger.info(that._server.id + '-' + websocket.id + ':sendMessage:' + msgText);
                } else {
                    var msgUrl = server.websocketUrl + '/' + encodeURIComponent(msgText);
                    websocket = new Socket(msgUrl);
                    websocket._server = server;
                    websocket._logger = _logger;
                    server.index++;
                    websocket.id = server.index;
                    websocket._logger.info(that._server.id + '-' + websocket.id + ':sendMessageUrl:' + msgUrl);
                    websocket.onopen = function (event) {
                    };
                    websocket.onmessage = function (event) {
                        if (event.data === '0') {
                            //心跳回应
                            this._logger.info(this._server.id + '-' + this.id + ':onMessage:服务端心跳响应');
                        } else {
                            this._logger.info(this._server.id + '-' + this.id + ':onMessage:' + event.data);
                            var res = eval('(' + event.data + ')');
                            if (res.sid) {
                                this._server.sid = res.sid;
                                //保持
                                this._logger.info(this._server.id + '-' + this.id + ':hold:' + res.sid);
                                that._websocket = this;
                                //启动心跳
                                that._websocket.heardbeat = setInterval(function () {
                                    that._websocket.send('1');
                                }, 5000);
                            }
                            try {
                                that.notify(res);
                            } catch (e) {
                                this._logger.error(this._server.id + '-' + this.id + ':error:' + e);
                            }
                        }
                    };
                    websocket.onclose = function (event) {
                        if (this.heardbeat) {
                            clearInterval(this.heardbeat);
                            this.heardbeat = null;
                        }
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
            message.send = function (route, param, callback) {
                var that = this;
                param.sid = that._server.sid;
                var httpUrl = that._server.httpUrl + route + '?callback=?';
                $.getJSON(httpUrl, param, function (res) {
                    if (res.sid) {
                        that._server.sid = res.sid;
                    }
                    if (callback) {
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