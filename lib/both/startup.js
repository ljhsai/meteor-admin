AdminTables = {};

adminTablesDom = '<"box"<"box-header"<"box-toolbar"<"pull-left"<lf>><"pull-right"p>>><"box-body"t>>';

adminEditButton = {
    data: '_id',
    title: AdminDashboard.geti18n("edit"),
    createdCell: function (node, cellData, rowData) {
        return $(node).html(Blaze.toHTMLWithData(Template.adminEditBtn, {_id: cellData}));
    },
    width: '40px',
    orderable: false
};

adminDelButton = {
    data: '_id',
    title: AdminDashboard.geti18n("delete"),
    createdCell: function (node, cellData, rowData) {
        return $(node).html(Blaze.toHTMLWithData(Template.adminDeleteBtn, {_id: cellData}));
    },
    width: '40px',
    orderable: false
};

adminEditDelButtons = [adminEditButton, adminDelButton];

defaultColumns = function () {
    return [
        {
            data: '_id',
            title: 'ID'
        }
    ];
};

adminTablePubName = function (collection) {
    return "admin_tabular_" + collection;
};

adminCreateTables = function (collections) {
    return _.each(_.has(AdminConfig, "collections") ? AdminConfig.collections : null, function (collection, name) {
        var columns;
        _.defaults(collection, {
            showEditColumn: true,
            showDelColumn: true
        });
        columns = _.map(collection.tableColumns, function (column) {
            var createdCell;
            if (column.template) {
                createdCell = function (node, cellData, rowData) {
                    $(node).html('');
                    return Blaze.renderWithData(Template[column.template], {value: cellData, doc: rowData});
                };
            }
            return {
                data: column.name,
                title: column.label,
                createdCell: createdCell
            };
        });
        if (columns.length === 0) {
            columns = defaultColumns();
        }
        if (collection.showEditColumn) {
            columns.push(adminEditButton);
        }
        if (collection.showDelColumn) {
            columns.push(adminDelButton);
        }

        AdminTables[name] = new Tabular.Table({
            name: name,
            collection: adminCollectionObject(name),
            pub: collection.children && adminTablePubName(name),
            sub: collection.sub,
            columns: columns,
            extraFields: collection.extraFields,
            dom: adminTablesDom
        });
    });
};

adminCreateRoutes = function (collections) {
    _.each(collections, adminCreateRouteView);
    _.each(collections, adminCreateRouteNew);
    return _.each(collections, adminCreateRouteEdit);
};

adminCreateRouteView = function (collection, collectionName) {
    return Router.route("adminDashboard" + collectionName + "View", adminCreateRouteViewOptions(collection, collectionName));
};

adminCreateRouteViewOptions = function (collection, collectionName) {
    var options, _ref;
    options = {
        path: "/admin/" + collectionName,
        template: "AdminDashboardViewWrapper",
        controller: AdminController,
        data: function () {
            return {
                admin_table: AdminTables[collectionName]
            };
        },
        action: function () {
            return this.render();
        },
        onAfterAction: function () {
            var _ref, _ref1;
            Session.set('admin_title', collectionName);
            Session.set('admin_subtitle', 'View');
            Session.set('admin_collection_name', collectionName);
            return (_ref = collection.routes) != null ? (_ref1 = _ref.view) != null ? _ref1.onAfterAction : null : null;
        }
    };
    return _.defaults(options, (_ref = collection.routes) != null ? _ref.view : null);
};

adminCreateRouteNew = function (collection, collectionName) {
    return Router.route("adminDashboard" + collectionName + "New", adminCreateRouteNewOptions(collection, collectionName));
};

adminCreateRouteNewOptions = function (collection, collectionName) {
    var options, _ref;
    options = {
        path: "/admin/" + collectionName + "/new",
        template: "AdminDashboardNew",
        controller: AdminController,
        action: function () {
            return this.render();
        },
        onAfterAction: function () {
            var _ref, _ref1;
            Session.set('admin_title', AdminDashboard.collectionLabel(collectionName));
            Session.set('admin_subtitle', 'Create new');
            Session.set('admin_collection_page', 'new');
            Session.set('admin_collection_name', collectionName);
            return (_ref = collection.routes) != null ? (_ref1 = _ref["new"]) != null ? _ref1.onAfterAction : void 0 : void 0;
        },
        data: function () {
            return {
                admin_collection: adminCollectionObject(collectionName)
            };
        }
    };
    return _.defaults(options, (_ref = collection.routes) != null ? _ref["new"] : null);
};

adminCreateRouteEdit = function (collection, collectionName) {
    return Router.route("adminDashboard" + collectionName + "Edit", adminCreateRouteEditOptions(collection, collectionName));
};

adminCreateRouteEditOptions = function (collection, collectionName) {
    var options, _ref;
    options = {
        path: "/admin/" + collectionName + "/:_id/edit",
        template: "AdminDashboardEdit",
        controller: AdminController,
        waitOn: function () {
            var _ref, _ref1;
            Meteor.subscribe('adminCollectionDoc', collectionName, parseID(this.params._id));
            return (_ref = collection.routes) != null ? (_ref1 = _ref.edit) != null ? _ref1.waitOn : void 0 : void 0;
        },
        action: function () {
            return this.render();
        },
        onAfterAction: function () {
            var _ref, _ref1;
            Session.set('admin_title', AdminDashboard.collectionLabel(collectionName));
            Session.set('admin_subtitle', 'Edit ' + this.params._id);
            Session.set('admin_collection_page', 'edit');
            Session.set('admin_collection_name', collectionName);
            Session.set('admin_id', parseID(this.params._id));
            Session.set('admin_doc', adminCollectionObject(collectionName).findOne({
                _id: parseID(this.params._id)
            }));
            return (_ref = collection.routes) != null ? (_ref1 = _ref.edit) != null ? _ref1.onAfterAction : void 0 : void 0;
        },
        data: function () {
            return {
                admin_collection: adminCollectionObject(collectionName)
            };
        }
    };
    return _.defaults(options, (_ref = collection.routes) != null ? _ref.edit : void 0);
};

adminPublishTables = function (collections) {
    return _.each(collections, function (collection, name) {
        if (!collection.children) {
            return;
        }

        Meteor.publishComposite(adminTablePubName(name), function (tableName, ids, fields) {
            var extraFields;
            check(tableName, String);
            check(ids, Array);
            check(fields, Match.Optional(Object));
            extraFields = _.reduce(collection.extraFields, function (fields, name) {
                fields[name] = 1;
                return fields;
            }, {});
            _.extend(fields, extraFields);
            this.unblock();
            return {
                find: function () {
                    this.unblock();
                    return adminCollectionObject(name).find({
                        _id: {
                            $in: ids
                        }
                    }, {
                        fields: fields
                    });
                },
                children: collection.children
            };
        });
    });
};

Meteor.startup(function () {
    if (Meteor.isClient) {
        Session.set("showLoadingIndicator", true);

        function getUserLanguage() {
            if(_.has(AdminConfig, "lang")) return AdminConfig.lang;
            return "zh";
        }

        TAPi18n.setLanguage(getUserLanguage())
            .done(function () {
                Session.set("showLoadingIndicator", false);
            })
            .fail(function (error_message) {
                // Handle the situation
                console.log(error_message);
            });
    }
    adminCreateTables(AdminConfig ? AdminConfig.collections : null);
    adminCreateRoutes(AdminConfig ? AdminConfig.collections : null);
    if (Meteor.isServer) {
        adminPublishTables(AdminConfig ? AdminConfig.collections : null);
    }
    if (AdminTables.Users) {
        return;
    }
    return AdminTables.Users = new Tabular.Table({
        changeSelector: function (selector, userId) {
            var $or;
            $or = selector['$or'];
            $or && (selector['$or'] = _.map($or, function (exp) {
                var _ref;
                if (((_ref = exp.emails) != null ? _ref['$regex'] : null) != null) {
                    return {
                        emails: {
                            $elemMatch: {
                                address: exp.emails
                            }
                        }
                    };
                } else {
                    return exp;
                }
            }));
            return selector;
        },
        name: 'Users',
        collection: Meteor.users,
        columns: _.union([
            {
                data: '_id',
                title: 'Admin',
                createdCell: function (node, cellData, rowData) {
                    return $(node).html(Blaze.toHTMLWithData(Template.adminUsersIsAdmin, {_id: cellData}));
                },
                width: '40px'
            }, {
                data: 'emails',
                title: 'Email',
                render: function (value) {
                    return value[0].address;
                },
                searchable: true
            }, {
                data: 'emails',
                title: 'Mail',
                createdCell: function (node, cellData, rowData) {
                    return $(node).html(Blaze.toHTMLWithData(Template.adminUsersMailBtn, {emails: cellData}));
                },
                width: '40px'
            }, {
                data: 'createdAt',
                title: AdminDashboard.geti18n('joined')
            }
        ], adminEditDelButtons),
        dom: adminTablesDom
    });
});

