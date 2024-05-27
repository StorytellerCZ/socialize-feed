/* global Package */

/* eslint-disable import/no-unresolved, global-require */
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { User } from 'meteor/socialize:user-model';
import { publishComposite } from 'meteor/reywood:publish-composite';


const optionsArgumentCheck = {
    limit: Match.Optional(Number),
    skip: Match.Optional(Number),
    sort: Match.Optional(Object),
};

const genericChildren = [
    {
        find(post) {
            if (post.posterId !== this.userId && post.linkedObjectId !== this.userId) {
                return Meteor.users.find({ _id: { $in: [post.posterId, post.linkedObjectId] } }, { fields: User.fieldsToPublish });
            }
            return undefined;
        },
    },
    {
        find(post) {
            return post.comments({ limit: 1, sort: { createdAt: -1 } });
        },
        children: [
            {
                find(comment) {
                    return comment.likesBy(this.userId);
                },
            },
            {
                find(comment) {
                    if (comment.userId !== this.userId) {
                        return Meteor.users.find({ _id: comment.userId }, { fields: User.fieldsToPublish });
                    }
                    return undefined;
                },
            },
        ],
    },
    {
        find(post) {
            return post.likesBy(this.userId);
        },
    },
];

publishComposite('socialize.feed.posts', function publishFeedPosts(userId, options = { limit: 10, sort: { createdAt: -1 } }) {
    check(userId, String);
    check(options, optionsArgumentCheck);

    if (!this.userId) {
        return this.ready();
    }

    const currentUser = User.createEmpty(this.userId);
    const userToPublish = User.createEmpty(userId);

    if (userToPublish.isSelf(currentUser) || (!currentUser.blocksUser(userToPublish) && !userToPublish.blocksUser(currentUser))) {
        return {
            find() {
                return userToPublish.feed().posts(options);
            },
            children: genericChildren,
        };
    }
    return this.ready();
});

publishComposite('socialize.feed.postsByOwner', function publishPostsByOwner(userId, options = { limit: 10, sort: { createdAt: -1 } }) {
    check(userId, String);
    check(options, optionsArgumentCheck);

    if (!this.userId) {
        return this.ready();
    }

    const currentUser = User.createEmpty(this.userId);
    const userToPublish = User.createEmpty(userId);

    if (userToPublish.isSelf(currentUser) || (!currentUser.blocksUser(userToPublish) && !userToPublish.blocksUser(currentUser))) {
        return {
            find() {
                return userToPublish.feed().postsByOwner(options);
            },
            children: genericChildren,
        };
    }
    return this.ready();
});

if (Package['socialize:friendships']) {
    const { FriendsCollection } = require('meteor/socialize:friendships');
    const friendPublication = {
        find(post) {
            return FriendsCollection.find({ userId: this.userId, friendId: post.linkedObjectId });
        },
    };
    publishComposite('socialize.feed.friendsPosts', function publishFriendPosts(userId, options = { limit: 10, sort: { createdAt: -1 } }) {
        check(userId, String);
        check(options, optionsArgumentCheck);

        if (!this.userId) {
            return this.ready();
        }

        const currentUser = User.createEmpty(this.userId);
        const userToPublish = User.createEmpty(userId);

        if (userToPublish.isSelf(currentUser) || (!currentUser.blocksUser(userToPublish) && !userToPublish.blocksUser(currentUser))) {
            return {
                async find() {
                    return await userToPublish.feed().friendsPostsAsync(options);
                },
                children: [
                    ...genericChildren,
                    friendPublication,
                ],
            };
        }
        return this.ready();
    });

    publishComposite('socialize.feed.friendsPostsToOwner', function publishFriendPostsToOwner(userId, options = { limit: 10, sort: { createdAt: -1 } }) {
        check(userId, String);
        check(options, optionsArgumentCheck);

        if (!this.userId) {
            return this.ready();
        }

        const currentUser = User.createEmpty(this.userId);
        const userToPublish = User.createEmpty(userId);

        if (userToPublish.isSelf(currentUser) || (!currentUser.blocksUser(userToPublish) && !userToPublish.blocksUser(currentUser))) {
            return {
                async find() {
                    return userToPublish.feed().friendsPostsToOwnerAsync(options);
                },
                children: [
                    ...genericChildren,
                    friendPublication,
                ],
            };
        }
        return this.ready();
    });

    publishComposite('socialize.feed.ownersPostsToFriends', function publishOwnersPostsToFriends(userId, options = { limit: 10, sort: { createdAt: -1 } }) {
        check(userId, String);
        check(options, optionsArgumentCheck);

        if (!this.userId) {
            return this.ready();
        }

        const currentUser = User.createEmpty(this.userId);
        const userToPublish = User.createEmpty(userId);

        if (userToPublish.isSelf(currentUser) || (!currentUser.blocksUser(userToPublish) && !userToPublish.blocksUser(currentUser))) {
            return {
                async find() {
                    return userToPublish.feed().ownersPostsToFriendsAsync(options);
                },
                children: [
                    ...genericChildren,
                    friendPublication,
                ],
            };
        }
        return this.ready();
    });
}
