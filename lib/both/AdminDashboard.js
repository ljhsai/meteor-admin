AdminConfig = null;

AdminDashboard = {
    schemas: {},
    sidebarItems: [],
    collectionItems: [],

    geti18n: function (key) {
        return TAPi18n.__(key, null,AdminConfig ? AdminConfig.lang : "zh");
    },
    alertSuccess: function (message) {
        return Session.set('adminSuccess', message);
    },

    alertFailure: function (message) {
        return Session.set('adminError', message);
    },

    checkAdmin: function () {
        if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            Meteor.call('adminCheckAdmin');
            if (_.isString((AdminConfig ? AdminConfig.nonAdminRedirectRoute : null))) {
                Router.go(AdminConfig.nonAdminRedirectRoute);
            }
        }
        if (_.isFunction(this.next)) {
            return this.next();
        }
    },

    adminRoutes: ['adminDashboard', 'adminDashboardUsersNew', 'adminDashboardUsersEdit', 'adminDashboardView', 'adminDashboardNew', 'adminDashboardEdit'],

    collectionLabel: function (collection) {
        if (collection.toLowerCase() === 'users') {
            return 'Users';
        } else if (collection && _.isString(AdminConfig.collections[collection].label)) {
            return AdminConfig.collections[collection].label;
        } else {
            return Session.get('admin_collection_name');
        }
    },

    addSidebarItem: function (title, url, options) {
        var item;
        item = {
            title: title
        };
        if (_.isObject(url) && _.isUndefined(options)) {
            item.options = url;
        } else {
            item.url = url;
            item.options = options;
        }
        return this.sidebarItems.push(item);
    },

    extendSidebarItem: function (title, urls) {
        var existing;
        if (_.isObject(urls)) {
            urls = [urls];
        }
        existing = _.find(this.sidebarItems, function (item) {
            return item.title === title;
        });
        if (existing) {
            return existing.options.urls = _.union(existing.options.urls, urls);
        }
    },

    addCollectionItem: function (fn) {
        return this.collectionItems.push(fn);
    },

    path: function (s) {
        var path;
        path = '/admin';
        if (_.isString(s) && s.length > 0) {
            path += (s[0] === '/' ? '' : '/') + s;
        }
        return path;
    }
};

AdminDashboard.schemas.newUser = new SimpleSchema({
    email: {
        type: String,
        label: TAPi18n.__("email")
    },
    chooseOwnPassword: {
        type: Boolean,
        label: TAPi18n.__('resetPasswordLable'),
        defaultValue: true
    },
    password: {
        type: String,
        label: TAPi18n.__('password'),
        optional: true
    },
    sendPassword: {
        type: Boolean,
        label: TAPi18n.__('sendPasswordLable'),
        optional: true
    }
});

AdminDashboard.schemas.sendResetPasswordEmail = new SimpleSchema({
    _id: {
        type: String
    }
});

AdminDashboard.schemas.changePassword = new SimpleSchema({
    _id: {
        type: String
    },
    password: {
        type: String
    }
});
