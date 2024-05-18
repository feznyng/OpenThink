import Fuse from 'fuse.js';

export const sections = [
    //'General',
    //'Membership',
    //'Groups and Projects',
    //'Posts and Relations',
    //'Tasks',
    //'Events',
    //'Tags',
    'Messages',
    'Advanced'
]

export const validateUserType = (userType, typesRequired) => {
    return typesRequired.includes(userType)
}

export const perms = [
    {
        title: 'Create Post',
        id: 'create_post',
        desc: 'Allow members create posts.',
        type: "Posts and Relations",
    },
    {
        title: "Delete Posts",
        id: 'delete_post',
        desc: "Allows members to delete any post in this group. All users can delete their any posts they created.",
        type: "Posts and Relations",
    },
    {
        title: "Admin",
        id: 'delete_post',
        desc: "Grants all permissions by default. Will override all other settings on this page.",
        type: "Advanced",
    },
    {
        title: "Pin Posts",
        id: 'pin_post',
        desc: "Allows members to manage pinned posts.",
        type: "Posts and Relations",
    },
    {
        title: "Wiki Posts",
        id: 'wiki_post',
        desc: "Allows members to posts in the group info page",
        type: "Posts and Relations",
    },
    {
        title: "Create Relations",
        id: 'create_relation',
        desc: "Allows members to create relations between posts they've created and other members' posts.",
        type: "Posts and Relations",
    },
    {
        title: "Manage Relations",
        id: 'manage_relations',
        desc: "Allows members to create and delete relations between any post in the post space.",
        type: "Posts and Relations",
    },
    {
        title: "Visualize",
        id: 'visualize_posts',
        desc: "Allows members to visualize posts.",
        type: "Posts and Relations",
    },
    {
        title: "Cross Post to this Group",
        id: 'cross_post',
        desc: "Allows members to cross-post from other groups to this group.",
        type: "Posts and Relations",
    },
    {
        title: "Cross-Post from this Group",
        id: 'repost',
        desc: "Allows members to cross-post posts from this group to other groups.",
        type: "Posts and Relations",
    },    {
        title: "Create Live Posts",
        id: 'live_posts',
        desc: "Allow members to create live posts with real-time comments and related posts.",
        type: "Posts and Relations",
    },
    {
        title: "View Private Posts",
        id: 'post_visibility',
        desc: "Allow members to view private posts.",
        type: "Posts and Relations",
    },
    {
        title: "Post As Group",
        id: 'post_as',
        desc: "Allow members to post on behalf of the group.",
        type: "Posts and Relations",
    },
    {
        title: "Manage Tags",
        id: 'manage_tags',
        desc: "Allow members to add and remove tags from the group.",
        type: "Tags",
    },
    {
        title: "Use any tag",
        id: 'use_any_tag',
        desc: "Allow members to any tag including those not specified in the group.",
        type: "Tags",
    },
    {
        title: "Manage Group General Settings",
        id: 'manage_general_settings',
        desc: "Allow members to manage the name, description, icon, bannerpic, etc. for this group.",
        type: "General",
    },
    {
        title: "Manage Roles",
        id: 'manage_roles',
        desc: "Allow members to manage the roles in this group.",
        type: "Membership",
    },
    {
        title: "Invite members",
        id: 'invite_members',
        desc: "Allow members to invite members to this group.",
        type: "Membership",
    },
    {
        title: "Change Nickname",
        id: 'change_nickname',
        desc: "Allow members to change their own nickname",
        type: "Membership",
    },
    {
        title: "Manage Nicknames",
        id: 'manage_nickname',
        desc: "Allow members to manage nicknames.",
        type: "Membership",
    },
    {
        title: "Remove Members",
        id: 'remove_members',
        desc: "Allow members to remove members from this group.",
        type: "Membership",
    },
    {
        title: "Ban Members",
        id: 'ban_members',
        desc: "Allow members to permanently ban members from this group.",
        type: "Membership",
    },
    {
        title: "Create Subgroups",
        id: 'manage_subgroups',
        desc: "Allow members to create subgroups in this group.",
        type: "Groups and Projects",
    },
    {
        title: "Create Projects",
        id: 'manage_projects',
        desc: "Allow members to create projects in this group.",
        type: "Groups and Projects",
    },
    {
        title: "Create Shared Projects",
        id: 'manage_shared_projects',
        desc: "Allow members to create shared projects with other groups.",
        type: "Groups and Projects",
    },
    {
        title: "Visualize Group",
        id: 'visualize_group',
        desc: "Allow members to visualize this group.",
        type: "Groups and Projects",
    },
    {
        title: "View People",
        id: 'view_people',
        desc: "Allow members to view other members in this group.",
        type: "Membership",
    },
    {
        title: "Manage Custom Emojis",
        id: 'manage_custom_emoji',
        desc: "Allow members to delete and add custom emojis to this group.",
        type: "General",
    },
    {
        title: "Manage Categories",
        id: 'manage_categories',
        desc: "Allow members to create and add channel categories to this group.",
        type: "General",
    },
    {
        title: "Create Shared Channels",
        id: 'create_shared_channels',
        desc: "Allow members to create shared channels with other groups",
        default: false,
        type: "Messages",
    },
    {
        title: "Manage Sections",
        id: 'manage_sections',
        desc: "Allow members to create, delete, and edit sections in the tasks page.",
        type: "Tasks",
    },
    {
        title: "Manage Assignees",
        id: 'manage_assignees',
        desc: "Allow members to manage assignees for every task.",
        type: "Tasks",
    },
    {
        title: "View Tasks",
        id: 'view_tasks',
        desc: "Allow members to see the task page.",
        type: "Tasks",
    },
    {
        title: "View Events",
        id: 'view_events',
        desc: "Allow members to see the events page.",
        type: "Events",
    },
    {
        title: "View Calendar",
        id: 'view_calendar',
        desc: "Allow members to see the calendar in the events page.",
        type: "Events",
    },
    {
        title: "Manage Events",
        id: 'manage_events',
        desc: "Allow members to update events using the calendar.",
        type: "Events",
    },
    {
        title: "View Text Channels",
        id: 'view_text_channels',
        desc: "Allow members to view text channels.",
        default: true,
        type: "Messages",
    },
    {
        title: "Send Messages",
        id: 'send_messages',
        desc: "Allow members to send messages in public channels. Private channels maintain their own access permissions.",
        type: "Messages",
        default: true,
    },
    {
        title: "Post Embed Links",
        id: 'post_embed_links',
        desc: "Allow members to create posts with link embeds.",
        type: "Posts and Relations",
    },
    {
        title: "Message Embed Links",
        id: 'message_embed_links',
        desc: "Allow members to send messages with link embeds.",
        type: "Messages",
        default: true,
    },
    {
        title: "Attach files to Posts",
        id: 'post_attach_files',
        desc: "Allow members to attach files to their posts.",
        type: "Posts and Relations",
    },
    {
        title: "Attach files to messages",
        id: 'message_attach_files',
        desc: "Allow members to attach files to their messages.",
        type: "",
    },
    {
        title: "Manage Channels",
        id: 'manage_channels',
        desc: "Allow members to create, edit, and delete channels.",
        type: "Messages",
        default: false,
    },
    {
        title: "Manage Messages",
        id: 'manage_message_settings',
        desc: "Allow members to delete and pin any message.",
        type: "General",
    },
    {
        title: "Add Reactions",
        id: 'post_add_reactions',
        desc: "Allow members to create new reactions to posts. Members can still reacts using existing reactions.",
        type: "Post and Relations",
    },
    {
        title: "Add Reactions",
        id: 'message_add_reactions',
        desc: "Allow members to create new reactions to messages. Members can still react using existing reactions.",
        type: "Messages",
        default: true,
    },
    {
        title: "Mention @everyone, @here, a channel and all roles",
        id: 'mention_universal',
        desc: "Allow members to mention every member of this group, the channel the message was sent in, and any role.",
        type: "Messages",
        default: false,
    },
]

/*
{
    title: "",
    id: "",
    desc: "",
    type: "",
}
*/

const options = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
    // threshold: 0.6,
    // distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    // ignoreFieldNorm: false,
    keys: [
        "title",
        "desc",
        "type",
      ]
  };

export const permFuse = new Fuse(perms, options);

const permissions = {

}
perms.forEach(perm => {
    if (perm.default) {
        permissions[perm.id] = true;
    }
})

export const newRole = {
    name: 'new role',
    description: '',
    color: '',
    permissions
}