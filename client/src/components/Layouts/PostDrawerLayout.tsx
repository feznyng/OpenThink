import { Dialog } from '@material-ui/core'
import { Collapse, Slide } from '@mui/material'
import React, { ReactElement } from 'react'
import { useAppSelector } from '../../Store'

const defaultPostViewWidth = 600

interface PostDrawerLayoutProps {
  main: ReactElement,
  postView: ReactElement,
  open: boolean,
  postViewWidth?: number,
}

export default function PostDrawerLayout({main, postView, postViewWidth = defaultPostViewWidth, open}: PostDrawerLayoutProps) {
  const mobile = useAppSelector(state => state.uiActions.mobile)

  return (
    <div style={{position: 'relative', width: '100%', height: "100%"}}>
      <div style={{width: "100%", height: '100%'}}>
        {main}
      </div>
      <Collapse orientation='horizontal' in={open && !mobile} style={{position: 'absolute', right: 0, top: 0, height: '100%'}}>
        <div style={{width: postViewWidth, backgroundColor: '#303030', borderWidth: 1, height: '100%', maxHeight: '100vh', overflow: 'auto'}}>
         {postView}
        </div>
      </Collapse>


      <Dialog
          open={open && mobile}
          fullScreen
      >
        {postView}
      </Dialog>
    </div>
  )
}
