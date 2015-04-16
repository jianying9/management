define('home/home', ['require', 'yy/yy', 'yy/form', 'yy/button', 'yy/list', 'crypto', 'yy/module'], function(require) {
    var _yy = require('yy/yy');
    var self = {};
    var _event = _yy.getEvent();
    var _message = _yy.getMessage();
    var _utils = _yy.getUtils();
    self.init = function(thisModule) {
        var md5Button = thisModule.findByKey('md5-button');
        _event.bind(md5Button, 'click', function(thisCom) {
            var md5InputForm = thisModule.findByKey('md5-input-form');
            var md5OutputForm = thisModule.findByKey('md5-output-form');
            var inputData = md5InputForm.getData();
            var md5Text = CryptoJS.MD5(inputData.inputText).toString();
            md5OutputForm.setData('outputText', md5Text);
        });
        //
        var groupList = thisModule.findByKey('group-list');
        groupList.init({
            key: 'groupName',
            itemClazz: '',
            itemDataToHtml: function(itemData) {
                return itemData.groupName;
            },
            itemCompleted: function(itemCom) {
                _event.bind(itemCom, 'click', function(thisCom) {
                    thisCom.selected();
                    _message.send({
                        act: 'WOLF_INQUIRE_SERVICE',
                        groupName: thisCom.key,
                        pageIndex: 1,
                        pageSize: 100
                    });
                });
            }
        });
        _message.listen(groupList, 'WOLF_INQUIRE_GROUP', function(thisCom, msg) {
            if (msg.state === 'SUCCESS') {
                var data = msg.data;
                thisCom.loadData(data.list);
            }
        });
        //
        var serviceList = thisModule.findByKey('service-list');
        serviceList.init({
            key: 'actionName',
            itemClazz: '',
            itemDataToHtml: function(itemData) {
                var result = '<div class="actionName">' + itemData.actionName + '</div>'
                        + '<div class="description">' + itemData.desc + '</div>';
                return result;
            },
            itemCompleted: function(itemCom) {
                _event.bind(itemCom, 'click', function(thisCom) {
                    window.open('service.html?actionName=' + thisCom.key);
                });
            }
        });
        _message.listen(serviceList, 'WOLF_INQUIRE_SERVICE', function(thisCom, msg) {
            if (msg.state === 'SUCCESS') {
                var data = msg.data;
                thisCom.clear();
                thisCom.loadData(data.list);
                thisCom.show();
            }
        });
        //页面初始化
        _message.send({
            act: 'WOLF_INQUIRE_GROUP',
            pageIndex: 1,
            pageSize: 100
        });
    };
    return self;
});