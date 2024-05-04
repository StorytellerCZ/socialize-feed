/* global Package */
Package.describe({
    name: 'socialize:feed',
    summary: 'A package for impmementing a social network style news feed',
    version: '2.0.0',
    git: 'https://github.com/copleykj/socialize-feed.git',
});

Package.onUse(function _(api) {
    api.versionsFrom(['2.8.1', '3.0-rc.0']);

    api.use([
        'check',
        'reywood:publish-composite@1.8.9',
        'socialize:user-blocking@2.0.0',
        'socialize:postable@2.0.0',
    ]);

    api.use('socialize:friendships@2.0.0', { weak: true });

    api.mainModule('server/server.js', 'server');
    api.mainModule('common/common.js', 'client');
});
