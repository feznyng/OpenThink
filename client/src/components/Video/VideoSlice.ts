import { createSlice } from '@reduxjs/toolkit'
import store from '../../Store'

interface VideoState {
    playing: null | number,
    volume: number,
    hovering: boolean,
}
  
const initialState: VideoState = {
    playing: null,
    volume: 100,
    hovering: false
}

export const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setPlaying: (state, {payload}: {payload: number | null}) => {
        state.playing = payload
    },
    setVolume: (state, {payload}: {payload: number}) => {
        if (payload > 100 || payload < 0) {
            throw "Volume must be a number between 0 and 100"
        }
        state.volume = payload
    },
    setCursorInactive: (state, {payload}: {payload: boolean}) => {
        state.hovering = payload
    },
  },
})

export const { setPlaying, setVolume, setCursorInactive } = videoSlice.actions

export default videoSlice.reducer

const CURSOR_INACTIVE_TIMEOUT = 4000

let timeout: any

function hideCursorAfterTime() {
    store.dispatch(setCursorInactive(false))
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        store.dispatch(setCursorInactive(true))
    }, CURSOR_INACTIVE_TIMEOUT)
}

document.addEventListener('mousemove', hideCursorAfterTime)
