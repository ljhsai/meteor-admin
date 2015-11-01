Package.describe({
    name: "luson:admin",
    summary: "A complete admin dashboard solution",
    version: "0.1.0",
    git: "https://github.com/ljhsai/meteor-admin"
});

Package.onUse(function (api) {

    both = ['client', 'server'];

    api.versionsFrom('1.2.1');
    api.use('ecmascript');

    api.use(
        [
            'iron:router',
            'check',
            'underscore',
            'tap:i18n',
            'reactive-var',
            'aldeed:collection2@2.5.0',
            'aldeed:autoform@5.5.1',
            'aldeed:template-extension@3.4.3',
            'alanning:roles@1.2.13',
            'raix:handlebar-helpers@0.2.5',
            'reywood:publish-composite@1.4.2',
            'momentjs:moment@2.10.6',
            'aldeed:tabular@1.4.0',
            'meteorhacks:unblock@1.1.0',
            'zimme:active-route@2.3.2',
            'mfactory:admin-lte'
        ],
        both);

    api.use(['less@1.0.0 || 2.5.0', 'session', 'jquery', 'templating'], 'client');

    api.use(['email'], 'server');

    api.add_files("package-tap.i18n", both);
    api.add_files([
        'i18n/en.i18n.json',
        'i18n/zh.i18n.json'
    ], both);

    api.add_files([
        'lib/both/AdminDashboard.js',
        'lib/both/router.js',
        'lib/both/utils.js',
        'lib/both/startup.js',
        'lib/both/collections.js'
    ], both);

    api.add_files([
        'lib/client/html/admin_templates.html',
        'lib/client/html/admin_widgets.html',
        'lib/client/html/admin_layouts.html',
        'lib/client/html/admin_sidebar.html',
        'lib/client/html/admin_header.html',
        'lib/client/css/admin-custom.less',
        'lib/client/js/admin_layout.js',
        'lib/client/js/helpers.js',
        'lib/client/js/templates.js',
        'lib/client/js/events.js',
        'lib/client/js/slim_scroll.js',
        'lib/client/js/autoForm.js'
    ], 'client');

    api.add_files([
        'lib/server/publish.js',
        'lib/server/methods.js'
    ], 'server');

    api.export('AdminDashboard', both)
});

Package.onTest(function (api) {

});
