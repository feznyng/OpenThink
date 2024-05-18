import { createSlice } from '@reduxjs/toolkit'
import store from '../../Store'
import { Filter, Sort } from '../../types/database'

const MAX_STORED_CONFIGS = 50
export type View = 'grid' | 'list'

interface FileSystemConfig {
    sorts: Sort[],
    lastUpdated: Date,
}

interface FileState {
   view: View,
   configs: {
       [spaceId: string]: FileSystemConfig
   },
   selectedIds: string[],
   focused: string | null,
   fileInfo: string | null
}
  
const initialState: FileState = {
    view: 'list',
    configs: {},
    selectedIds: [],
    focused: null,
    fileInfo: null
}

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setView: (state, {payload}: {payload: View}) => {
        state.view = payload
    },
    setFileInfo: (state, {payload}: {payload: string | null}) => {
        state.fileInfo = payload
    },
    setConfig: (state, {payload: {config, spaceId}}: {payload: {config: Partial<FileSystemConfig>, spaceId: number}}) => {
        const id = spaceId.toString()
        const existingConfig = state.configs[id]
        if (existingConfig) {
            state.configs[id] = {
                ...existingConfig,
                ...config,
                lastUpdated: new Date()
            }
        } else {
            state.configs[id] = {
                sorts: [],
                ...config,
                lastUpdated: new Date()
            }
            if (Object.keys(state.configs).length > MAX_STORED_CONFIGS) {
                let earliestConfigId = id
                for (const spaceId in state.configs) {
                    if (state.configs[spaceId].lastUpdated < state.configs[earliestConfigId].lastUpdated) {
                        earliestConfigId = spaceId
                    }
                }
                delete state.configs[earliestConfigId]
            }
        }
    },
  },
})

export const { setView, setConfig, setFileInfo } = fileSlice.actions

export default fileSlice.reducer