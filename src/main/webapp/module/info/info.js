define('info/info', ['require', 'yy/yy', 'yy/label', 'yy/form', 'yy/button', 'yy/list'], function(require) {
    var _yy = require('yy/yy');
    var self = {};
    var _event = _yy.getEvent();
    var _message = _yy.getMessage();
    var _httpServer = _yy.getConfig('httpServer');
    self.init = function(thisModule) {
        var actionName = _yy.getSession('actionName');
        //
        var requestList = thisModule.findByKey('request-list');
        requestList.init({
            key: 'name',
            itemClazz: '',
            itemDataToHtml: function(itemData) {
                var result = '<div>' + itemData.must + '</div>'
                        + '<div>' + itemData.name + '</div>'
                        + '<div>' + itemData.type + '</div>'
                        + '<div>' + itemData.desc + '</div>';
                return result;
            }
        });
        //
        var responseStateList = thisModule.findByKey('response-state-list');
        responseStateList.init({
            key: 'state',
            itemClazz: '',
            itemDataToHtml: function(itemData) {
                var result = '<div>' + itemData.state + '</div>'
                        + '<div>' + itemData.desc + '</div>';
                return result;
            }
        });
        //
        var responseList = thisModule.findByKey('response-list');
        responseList.init({
            key: 'name',
            itemClazz: '',
            itemDataToHtml: function(itemData) {
                var result = '<div>' + itemData.name + '</div>'
                        + '<div>' + itemData.type + '</div>'
                        + '<div>' + itemData.desc + '</div>';
                return result;
            }
        });
        //
        _message.listen(thisModule, 'WOLF_INQUIRE_SERVICE_INFO', function(thisCom, msg) {
            if (msg.state === 'SUCCESS') {
                var data = msg.data;
                var actionNameLabel = thisModule.findByKey('action-name-label');
                actionNameLabel.setLabel(_httpServer + '?act=' + data.actionName);
                var descriptionLabel = thisModule.findByKey('description-label');
                descriptionLabel.setLabel(data.desc);
                var otherInfo = '';
                if (data.page) {
                    otherInfo = otherInfo + '分页请求:pageIndex,pageSize,响应:pageIndex,pageSize,pageNum,pageTotal;';
                }
                if (data.validateSession) {
                    otherInfo = otherInfo + 'session验证;';
                }
                var otherLabel = thisModule.findByKey('other-label');
                otherLabel.setLabel(otherInfo);
                //
                requestList.loadData(data.requestConfigs);
                //
                responseStateList.loadData(data.responseStates);
                //
                responseList.loadData(data.responseConfigs);
                //动态渲染测试表单
                var testRequestForm = thisModule.findByKey('test-request-form');
                var inputHtml = '';
                if (data.page) {
                    inputHtml += '<div class="form_label">pageIndex:</div>'
                            + '<input name="pageIndex" value="1" />'
                            + '<div class="form_label">pageSize:</div>'
                            + '<input name="pageSize" value="6" />';
                }
                for (var index = 0; index < data.requestConfigs.length; index++) {
                    inputHtml += '<div class="form_label">' + data.requestConfigs[index].name + ':</div>'
                            + '<input name="' + data.requestConfigs[index].name + '" value="" />';
                }
                testRequestForm.$this.append(inputHtml);
                testRequestForm.init();
                //
                var actionName = _yy.getSession('actionName');
                var testResponseForm = thisModule.findByKey('test-response-form');
                var _parse = function(json, indent) {
                    var result = '';
                    var type = typeof json;
                    switch (type) {
                        case 'object':
                            var thisTab = '';
                            var childTab = '';
                            for (var index = 0; index < indent; index++) {
                                childTab += '  ';
                            }
                            for (var index = 0; index < indent - 1; index++) {
                                thisTab += '  ';
                            }
                            //判断是否是数组
                            if (Object.prototype.toString.call(json) === '[object Array]') {
                                if (json.length === 0) {
                                    result += '[]';
                                } else {
                                    result += '[';
                                    result += _parse(json[0], indent + 1) + ',\n';
                                    var hasData = false;
                                    for (var index = 1; index < json.length; index++) {
                                        hasData = true;
                                        result += childTab +  _parse(json[index], indent + 1) + ',\n';
                                    }
                                    if(hasData) {
                                        result = result.substr(0, result.length - 2);
                                    }
                                    result += ']';
                                }
                            } else {
                                var child = '';
                                for (var id in json) {
                                    child += childTab + '\"' + id + '\":' + _parse(json[id], indent + 1) + ',\n';
                                }
                                if(child !== '') {
                                    result += '{\n';
                                    result += child.substr(0, child.length - 2);
                                    result += '\n' + thisTab + '}';
                                } else {
                                    result += '{}';
                                }
                            }
                            break;
                        case 'number':
                            result = json;
                            break;
                        case 'string':
                            result = '\"' + json + '\"';
                            break;
                    }
                    return result;
                };
                _message.listen(testResponseForm, actionName, function(thisCom, msg) {
                    var responseData = _parse(msg, 1);
                    thisCom.setData('responseData', responseData);
                });
                //
                var testButton = thisModule.findByKey('test-button');
                _event.bind(testButton, 'click', function(thisCom) {
                    var msg = testRequestForm.getData();
                    var actionName = _yy.getSession('actionName');
                    msg.act = actionName;
                    _message.send(msg);
                });
            }
        });
        //页面初始化
        _message.send({
            act: 'WOLF_INQUIRE_SERVICE_INFO',
            actionName: actionName
        });
    };
    return self;
});