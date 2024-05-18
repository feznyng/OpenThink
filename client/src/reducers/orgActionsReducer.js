import { 
    AWAITING_GET_ORGANIZATIONS, 
    SUCCESS_GET_ORGANIZATIONS, 
    ERROR_GET_ORGANIZATIONS,
    AWAITING_GET_ORGANIZATION_BY_ID,
    SUCCESS_GET_ORGANIZATION_BY_ID,
    ERROR_GET_ORGANIZATION_BY_ID,
    PUSH_SPACE,
    CLEAR_SPACE,
    POP_SPACE,
    SET_ORIGIN,
    CLEAR_ORIGIN,
  } from '../actions/index';
  import {shallowEqual} from '../utils/objectutils';
  import store from '../Store';
  const initalState = {
      loading: false,
      spaceStack: [],
      startingLocation: '',
      currSpace: null,
      currPage: 1,
      currInfoPage: 1,
      currSettingsPage: 0,
      currUser: null,
      editedSpace: {
        name: '',
        description: '',
        profilepic: '',
        bannerpic: '',
        rules: [],
        longitude: null,
        latitude: null,
        address: null,
      },
      editedSpaceUser: {
        space_relation_notifications: false,
        post_notifications: false,
        project_notifications: false,
      },
      changedRoles: [],
  };


  const orgActionsReducer = (state = initalState, action) => {
      const { type, payload } = action;
    
      switch (type) {
        case AWAITING_GET_ORGANIZATIONS:
          return {
            ...state,
            loading: true,
            allOrganizations: [],
          }
        case SUCCESS_GET_ORGANIZATIONS:
          return {
            ...state,
            loading: false,
          }
        case ERROR_GET_ORGANIZATIONS:
          return {
            ...state,
            loading: false,
          }
        case AWAITING_GET_ORGANIZATION_BY_ID:
          return {
            ...state,
            loading: true,
          }
        case SUCCESS_GET_ORGANIZATION_BY_ID: {
          const {currSpace, currUser} = payload;
          const tabs = [
            {
              title: "About",
              link: 'about'
            },
            {
              title: "Home",
              link: '',
              default: true
            },
            /*
            {
              title: "Posts",
              link: 'posts'
            },
            */
            {
              title: "People",
              link: 'people'
            },
            {
              title: "Events",
              link: 'events'
            },
            {
              title: "Tasks",
              link: 'tasks'
            },
            {
              title: "Files",
              link: 'files'
            },
            {
              title: "Rooms",
              link: 'rooms'
            },
          ]
          if (!currSpace.project) {
              tabs.push(
                {
                  title: "Groups",
                  link: 'groups'
                }, 
                {
                  title: "Projects",
                  link: 'projects'
                },
              );
          }
          return {
            ...initalState,
            ...state,
            loading: false,
            currSpace: {...currSpace, currUser: undefined},
            currUser,
            editedSpace: {
              ...currSpace,
            },
            tabs
          }
        }
        case ERROR_GET_ORGANIZATION_BY_ID:
          return {
            ...state,
            loading: false,
          }
        case PUSH_SPACE:
          return {
            ...state,
            spaceStack: [...state.spaceStack, payload],
          }
        case POP_SPACE:
            return {
              ...state,
              spaceStack: state.spaceStack.slice(0, state.spaceStack.length - 1),
            }
         case CLEAR_SPACE:
            return {
              ...state,
              spaceStack: [],
              startingLocation: payload,
            }
        case CLEAR_ORIGIN:
            return {
              ...state,
              spaceStack: state.spaceStack.slice(0, state.spaceStack.length - 1),
              startingLocation: '',
            }
        case SET_ORIGIN:
            return {
              ...state,
              spaceStack: [],
              startingLocation: payload,
            }
        case 'SET_SPACE_PAGE':
          return {
            ...state,
            currPage: payload,
            currInfoPage: 0,
            
          }
        case 'SET_SPACE_INFO_PAGE':
            return {
              ...state,
              currInfoPage: payload
            }
        case 'SET_SPACE_SETTINGS_PAGE':
            return {
              ...state,
              currSettingsPage: payload
            }
        case 'SET_SPACE_WIKI':
          return {
            ...state,
            wikis: payload ? payload.map((w, i) => ({...w, index: i})) : []
          }
        case 'TOGGLE_GROUP_SETTINGS': {
          return {
            ...state,
            settingsOpen: !state.settingsOpen
          }
        }
        case 'TOGGLE_MESSAGES':
          return {
            ...state,
            messagesOpen: !state.messagesOpen
          }
        case 'SET_GENERAL_SETTINGS':
          const {editedSpace, spaceEdited} = payload;
          const currSpace = state.currSpace
          return {
            ...state,
            editedSpace,
            spaceEdited: !(
              editedSpace.name === currSpace.name &&
              editedSpace.description === currSpace.description &&
              editedSpace.profilepic === currSpace.profilepic &&
              editedSpace.bannerpic === currSpace.bannerpic &&
              editedSpace.latitude === currSpace.latitude &&
              editedSpace.longitude === currSpace.longitude &&
              editedSpace.address === currSpace.address &&
              editedSpace.type === currSpace.type &&
              editedSpace.access_type === currSpace.access_type &&
              editedSpace.require_request_answers === currSpace.require_request_answers &&
              editedSpace.access_questions === currSpace.access_questions &&
              editedSpace.user_request_description === currSpace.user_request_description
            )
          }
        case 'SET_PERSONAL_SETTINGS':
          const {editedSpaceUser, spaceUserEdited} = payload;
          const currUser = state.currUser;
          return {
            ...state,
            editedSpaceUser, 
            spaceUserEdited: !(
              !!editedSpaceUser.post_notifications === !!currUser.post_notifications &&
              !!editedSpaceUser.project_notifications === !!currUser.project_notifications &&
              !!editedSpaceUser.space_relation_notifications === !!currUser.space_relation_notifications
            )
        }
        case 'RESET_SPACE': {
          return {
            ...state,
            editedSpace: {
              ...state.currSpace,
            },
            editedSpaceUser: {
              ...state.currSpace
            },
            spaceEdited: false,
            spaceUserEdited: false
          }
        }
        case 'UPDATE_SPACE': {
          return {
            ...state,
            currSpace: payload,
            spaceEdited: false,
          }
        }
        case 'UPDATE_CURR_USER': {
          const currUser = payload;
          return {
            ...state,
            currUser,
            spaceUserEdited: false,
          }
        }
        case 'UPDATE_SPACE_USER': {
          const user = payload;
          return {
            ...state,
            currSpace: {
              ...state.currSpace,
              users: [
                ...state.currSpace.users.filter(u => u.user_id !== user.user_id),
                user
              ]
            }
          }
        }
        case 'DELETE_SPACE_USER': {
          const user = payload;
          return {
            ...state,
            currSpace: {
              ...state.currSpace,
              users: state.currSpace.users.filter(u => u.user_id !== user.user_id)
            }
          }
        }
        case 'SET_ROLES':{
          const roles = payload;
          return {
            ...state,
            roles,
            editedRoles: roles,
            changedRoles: [],

          }
        }
        case 'CREATE_ROLE': {
          const role = payload;
          const roles = [role, ...state.roles]
          return {
            ...state,
            currRole: role,
            roles,
            editedRoles: roles
          }
        }
        case 'DELETE_ROLE': {
          const role = payload;
          const roles = state.roles.filter(r => r.role_id !== role.role_id)
          return {
            ...state,
            roles,
            editedRoles: roles
          }
        }
        case 'UPDATE_ROLE': {
          const currRole = payload;
          const prevRole = state.roles.find(r => r.role_id === currRole.role_id);
          const changed = !shallowEqual(prevRole, currRole);
          const filteredChangeRoles = state.changedRoles.filter(r => r.role_id !== currRole.role_id);
          const changedRoles = changed ? [...filteredChangeRoles, currRole.role_id] : filteredChangeRoles
          return {
            ...state,
            currRole,
            changedRoles,
            editedRoles: [currRole, ...state.editedRoles.filter(r => r.role_id !== currRole.role_id)].sort((r1, r2) => r1.index - r2.index)
          }
        }
        case 'ASSIGN_ROLES':{
          return {
            ...state,
            messagesOpen: !state.messagesOpen
          }
        }
        case 'EDIT_ROLE': {
          const currRole = payload;
          return {
            ...state,
            currRole: currRole
          };
        }
        case 'UPDATE_SPACE_ROLES': {
          return {
            ...state,
            roles: state.editedRoles,
            changedRoles: []
          };
        }
        case 'UPDATE_ROLE_ORDER': {
          const editedRoles = payload;
          return {
            ...state,
            editedRoles: editedRoles.map((r, index) => ({...r, index})).sort((r1, r2) => r1.index - r2.index),
            changedRoles: editedRoles.map(r => r.role_id)
          }
        } 
        case 'ADD_USER_ROLES': {
          const {role_id, users} = payload;
          const savedRole = state.roles.find(r => r.role_id === role_id);
          const editedRole = state.editedRoles.find(r => r.role_id === role_id);

          if (savedRole) {
            savedRole.users = users;
          }
          if (editedRole) {
            editedRole.users = users;
          }

          return {
            ...state,
            roles: state.roles,
            editedRoles: state.editedRoles
          }
        } 
        case 'DELETE_ROLE_USER': {
          const {user, role_id} = payload;
          const savedRole = state.roles.find(r => r.role_id === role_id);
          const editedRole = state.editedRoles.find(r => r.role_id === role_id);

          if (savedRole) {
            savedRole.users = savedRole.users.filter(u => u.space_user_id !== user.space_user_id);
          }
          if (editedRole) {
            editedRole.users = editedRole.users.filter(u => u.space_user_id !== user.space_user_id);
          }

          return {
            ...state,
            roles: state.roles,
            editedRoles: state.editedRoles
          }
        }
        case 'SUCCESS_CREATE_CHILD_SPACE': {
          const space = payload;
          return {
            ...state,
            currSpace: {
              ...state.currSpace,
              related_spaces: [...state.currSpace.related_spaces, space]
            }
          }
        }
        case 'LEAVE_SPACE': {
          const spaceID = payload;
          return {
            ...state,
            settingsOpen: false
          }
        }
        case 'DELETE_SPACE_USER': {
          return {
            ...state,
            settingsOpen: false
          }
        }
        case 'SET_CURR_SPACE_POSTS': {
          return {
            ...state,
            currSpace: {
              ...state.currSpace,
              posts: payload
            }
          }
        }
        
        default:
          return state;
      }
    }
    
    export default orgActionsReducer;