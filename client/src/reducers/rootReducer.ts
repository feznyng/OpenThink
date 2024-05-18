import { combineReducers } from "redux";
import userActionsReducer from "./userActionsReducer";
import postActionsReducer from "./postActionsReducer";
import orgActionsReducer from './orgActionsReducer'
import uiActionsReducer from './uiActionsReducer'
import messageActionsReducer from './messageActionsReducer';
import task from '../components/Task/TaskSlice'
import wiki from '../components/Wiki/WikiSlice'
import video from '../components/Video/VideoSlice'
import publicSlice from '../components/SolidarityProject/PublicSlice'
import nav from '../components/MainNav/NavSlice'
import router from '../router/RouterSlice'
import file from '../components/File/FileSlice'
import user from '../utils/UserSlice'
import onboarding from '../components/Onboarding/OnboardingSlice'
import graph from '../components/GraphProject/GraphSlice'
import database from '../components/DatabaseViews/DatabaseSlice'

const rootReducer = combineReducers({
  userActions: userActionsReducer,
  postActions: postActionsReducer,
  orgActions: orgActionsReducer,
  uiActions: uiActionsReducer,
  messageActions: messageActionsReducer,
  task,
  wiki,
  video,
  public: publicSlice,
  nav,
  router,
  file,
  user,
  onboarding,
  graph,
  db: database
})

export default rootReducer;