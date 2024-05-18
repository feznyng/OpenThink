import Fuse from 'fuse.js';

export const roleFuse = new Fuse([], {
    keys: [
        "name",
        "description",
    ]
});