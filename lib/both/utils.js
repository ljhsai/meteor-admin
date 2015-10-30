adminCollectionObject = function (collection) {
    if (AdminConfig.collections[collection] && AdminConfig.collections[collection].collectionObject) {
        return AdminConfig.collections[collection].collectionObject;
    } else {
        return lookup(collection);
    }
};

adminCallback = function (name, args, callback) {
    var stop, _ref, _ref1;
    stop = false;
    if (typeof (AdminConfig  ? (_ref = AdminConfig.callbacks) != null ? _ref[name] : null : null) === 'function') {
        stop = (_ref1 = AdminConfig.callbacks)[name].apply(_ref1, args) === false;
    }
    if (typeof callback === 'function') {
        if (!stop) {
            return callback.apply(null, args);
        }
    }
};

lookup = function (obj, root, required) {
    var arr, ref;
    if (required == null) {
        required = true;
    }
    if (!root) {
        root = Meteor.isServer ? global : window;
    }
    if (typeof obj === 'string') {
        ref = root;
        arr = obj.split('.');
        while (arr.length && (ref = ref[arr.shift()])) {
            continue;
        }
        if (!ref && required) {
            throw new Error(obj + ' is not in the ' + root.toString());
        } else {
            return ref;
        }
    }
    return obj;
};

parseID = function (id) {
    if (typeof id === 'string') {
        if (id.indexOf("ObjectID") > -1) {
            return new Mongo.ObjectID(id.slice(id.indexOf('"') + 1, id.lastIndexOf('"')));
        } else {
            return id;
        }
    } else {
        return id;
    }
};

parseIDs = function (ids) {
    return _.map(ids, function (id) {
        return parseID(id);
    });
};

