import { Fade, Typography, LinearProgress, Slider, CircularProgress } from '@material-ui/core';
import { Fullscreen, FullscreenExit, Pause, PlayArrow, VolumeDown, VolumeUp } from '@material-ui/icons';
import { Collapse } from '@mui/material';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player'
import { formatSeconds } from '../../utils/dateutils';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useDispatch } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../Store';
import { setPlaying, setVolume } from './VideoSlice';
const AUTO_HIDE_BAR = 2000

interface VideoPlayerProps{
    link: string,
    id: number
}

export default function VideoPlayer({link, id}: VideoPlayerProps) {
    const [state, setState] = useState({
        showBar: false,
        hover: false,
        volHover: false,
        loaded: 0, 
        playedSeconds: 0,
        duration: 0,
        playing: true,
        muted: false,
        hideCursor: null,
        ready: false
    })

    const [played, setPlayed] = useState(0)
    const handle = useFullScreenHandle()
    const dispatch = useAppDispatch()
    const {playing, volume} = useAppSelector(state => state.video)

    const ref = useRef()
    const persistedShow = () => {
        setState({
            ...state,
            showBar: true
        })
        setTimeout(() => {
            setState({
                ...state,
                showBar: false
            })
        }, AUTO_HIDE_BAR)
    }
    
    const toggleFullscreen = () => {
        if (handle.active) {
            handle.exit()
        } else {
            handle.enter()
        }
    }

    const currPlaying = playing === id

    const throttledSeek = useCallback((value: number) => {
        setPlayed(value / 100);
        (ref.current as any)?.seekTo(value / 100)
    }, [ref.current])

    return (
        <FullScreen handle={handle}>
            <div 
                style={{position: 'relative', height: '100%', width: '100%', display: 'flex', alignItems: 'center'}} 
                onTouchStart={persistedShow}
                onMouseEnter={() => setState({...state, hover: true})}
                onMouseLeave={() => setState({...state, hover: false})}
            >
                
                <div
                    onClick={() => currPlaying ? dispatch(setPlaying(null)) : dispatch(setPlaying(id))}
                    onDoubleClick={toggleFullscreen}
                    style={{width: '100%', maxHeight: handle.active ? undefined : 500, height: '100%', position: 'relative'}}
                >
                    {
                        !state.ready &&
                        <div style={{position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <CircularProgress/>
                        </div>
                    }
                    <ReactPlayer 
                        url={link} 
                        ref={ref as any} 
                        onReady={() => setState({...state, ready: true})}
                        playing={state.playing && currPlaying}
                        width='100%'
                        volume={volume / 100}
                        height='100%'
                        muted={state.muted}
                        progressInterval={250}
                        onDuration={duration => setState({...state, duration})}
                        onProgress={({played, playedSeconds, loaded}) => {
                            setState({...state, playedSeconds, loaded})
                            setPlayed(played)
                            played === 1 && dispatch(setPlaying(null))
                        }}
                    />
                    
                </div>
                <Fade in={state.hover}>
                    <div 
                        
                        style={{position: 'absolute', bottom: 0, left: 0, height: handle.active ? 70 : 60, width: '100%', paddingLeft: 10, paddingRight: 15}}
                    >
                        <Slider
                            value={played * 100}
                            style={{marginBottom: 0, paddingBottom: 0, height: 0}}
                            onMouseDown={() => setState({...state, playing: false})}
                            onMouseUp={() => setState({...state, playing: true})}
                            onChange={(_, value) => {
                                throttledSeek((value as number))
                            }}
                        />
                        <div style={{display: 'flex', alignItems: 'center', paddingLeft: 10, paddingTop: 3, color: 'grey'}}>
                            <span 
                                onClick={() => currPlaying ? dispatch(setPlaying(null)) : dispatch(setPlaying(id))}
                            >
                                {currPlaying ? <Pause/> : <PlayArrow/>} 
                            </span>
                            <div
                                onMouseEnter={() => setState({...state, volHover: true})}
                                onMouseLeave={() => setState({...state, volHover: false})}
                                onClick={() => setState({...state, muted: !state.muted})}
                                style={{display: 'flex', alignItems: 'center', marginLeft: 20}}
                                onMouseDown={e => {e.preventDefault(); e.stopPropagation()}}
                            >
                                <VolumeUp/>
                                <Collapse orientation='horizontal' in={state.volHover}>
                                    <Slider 
                                        value={volume}
                                        onChange={(e, volume) => dispatch(setVolume(volume as number))}
                                        style={{width: 50, marginBottom: -5, marginLeft: 5}}
                                    />
                                </Collapse>
                                <Typography variant="caption" style={{marginLeft: 20}}>
                                    {formatSeconds(state.playedSeconds)} / {formatSeconds(state.duration)}
                                </Typography>
                            </div>
                        </div>
                        <div style={{position: 'absolute', right: 0, bottom: -4, height: '100%', display: 'flex', alignItems: 'center', paddingRight: 20, color: 'grey'}}>
                            <span onClick={toggleFullscreen}>{handle.active ? <FullscreenExit/> : <Fullscreen/>}</span> 
                        </div>
                    </div>
                </Fade>
            </div>
        </FullScreen>
    )
}
