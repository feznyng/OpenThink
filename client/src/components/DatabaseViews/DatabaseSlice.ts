import { createSlice } from "@reduxjs/toolkit"
import { Attribute, Entry, Group, Filter, Sort, View } from "../../types/database"

interface Database {
    lastViewId: string,
}

interface DatabaseState {
    databases: {
        [databaseId: string]: Database
    },
    entries: {
        [entryId: string]: Entry
    },
    views: {
        [viewId: string]: View
    },
    savedViews: {
        [viewId: string]: View
    }
}

const initialState: DatabaseState = {
    databases: {},
    entries: {},
    views: {},
    savedViews: {}
}

export const databaseSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        addDatabase: (state, {payload}: {payload: {db: Database, dbId: string}}) => {
            state.databases[payload.dbId] = payload.db
        },
        setView: (state, {payload}: {payload: {databaseId: string, viewId: string, view: View}}) => {
            const {databaseId, viewId, view} = payload
            state.databases[databaseId] = {
                ...state.databases[databaseId],
                lastViewId: viewId,
            }
        },
    },
  })
  
  export const { addDatabase, setView } = databaseSlice.actions
  
  export default databaseSlice.reducer