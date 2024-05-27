export default ({ PostableModel, PostsCollection, LinkParent }) => {
    class Feed extends PostableModel(LinkParent) {
        postsByOwner(options = {}) {
            return PostsCollection.find({ linkedObjectId: this._id, posterId: this._id }, options);
        }
    }
    return { Feed };
};

export const extendFeedForFriends = ({ Meteor, Feed, PostsCollection }) => {
    Feed.methods({
        friendsPosts(options = {}) {
            if (Meteor.isServer) {
                return this.friendsPostsAsync(options)
            }
            const currentUser = Meteor.user();
            if (currentUser) {
                const friendIds = currentUser.friends().map(friend => friend.friendId);
                friendIds.push(currentUser._id);

                return PostsCollection.find({ linkedObjectId: { $in: friendIds }, posterId: { $in: friendIds } }, options);
            }
            return undefined;
        },
        async friendsPostsAsync(options = {}) {
            const currentUser = await Meteor.user();
            if (currentUser) {
                const friends = await currentUser.friends().fetchAsync();
                const friendIds = friends.map(friend => friend.friendId);
                friendIds.push(currentUser._id);

                return PostsCollection.find({ linkedObjectId: { $in: friendIds }, posterId: { $in: friendIds } }, options);
            }
            return undefined;
        },
        friendsPostsToOwner(options = {}) {
            if (Meteor.isServer) {
                return this.friendsPostsToOwnerAsync(options)
            }
            const currentUser = Meteor.user();
            if (currentUser) {
                const friendIds = currentUser.friends().map(friend => friend.friendId);
                friendIds.push(currentUser._id);

                return PostsCollection.find({ linkedObjectId: this._id, posterId: { $in: friendIds } }, options);
            }
            return undefined;
        },
        async friendsPostsToOwnerAsync(options = {}) {
            const currentUser = await Meteor.user();
            if (currentUser) {
                const friends = await currentUser.friends().fetchAsync();
                const friendIds = friends.map(friend => friend.friendId);
                friendIds.push(currentUser._id);

                return PostsCollection.find({ linkedObjectId: this._id, posterId: { $in: friendIds } }, options);
            }
            return undefined;
        },
        ownersPostsToFriends(options = {}) {
            if (Meteor.isServer) {
                return this.ownersPostsToFriendsAsync(options)
            }
            const currentUser = Meteor.user();
            if (currentUser) {
                const friendIds = currentUser.friends().map(friend => friend.friendId);
                friendIds.push(currentUser._id);

                return PostsCollection.find({ linkedObjectId: { $in: friendIds }, posterId: this._id }, options);
            }
            return undefined;
        },
        async ownersPostsToFriendsAsync(options = {}) {
            const currentUser = await Meteor.user();
            if (currentUser) {
                const friends = await currentUser.friends().fetchAsync();
                const friendIds = friends.map(friend => friend.friendId);
                friendIds.push(currentUser._id);

                return PostsCollection.find({ linkedObjectId: { $in: friendIds }, posterId: this._id }, options);
            }
            return undefined;
        },
    });
};
