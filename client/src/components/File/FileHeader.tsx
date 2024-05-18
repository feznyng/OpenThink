import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import PostPath from '../Post/PostPath'
import { useAppSelector, useAppDispatch } from '../../Store'
import { IconButton } from '@material-ui/core'
import { GridView, ViewList, Info } from '@mui/icons-material'
import { setView, setFileInfo } from './FileSlice';
import { useHistory } from 'react-router'

interface FileHeaderProps {
    space: any,
    post: any
}

export default function FileHeader({space, post}: FileHeaderProps) {
    const {spaceId, ...spaceData} = useFragment(
        graphql`
            fragment FileHeader_space on Space {
                spaceId
                ...PostPathFragment_space
            }
        `,
        space
    )

    const postData = useFragment(
        graphql`
            fragment FileHeader_post on Post {
                postId
            }
        `,
        post
    )
    const view = useAppSelector(state => state.file.view)
    const fileInfo = useAppSelector(state => state.file.fileInfo)
    const dispatch = useAppDispatch()
    const history = useHistory()


    return (
        <div style={{height: 60, position: 'relative'}}>
            <div style={{position: 'absolute', top: 0, left: 0, height: '100%', display: 'flex', alignItems: 'center'}}>

                {/* Add visibility options button here */}
            </div>
            <div style={{position: 'absolute', top: 0, right: 0, height: '100%', display: 'flex', alignItems: 'center'}}>
                <IconButton
                    size="small"
                    onClick={() => dispatch(setView(view === 'grid' ? 'list' : 'grid'))}
                    style={{marginRight: 5}}
                >
                    {
                        view === 'grid' ? 
                        <GridView/>
                        :
                        <ViewList/>
                    }
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => dispatch(setFileInfo(fileInfo ? null : postData ? postData.postId.toString() : spaceData.spaceId.toString()))}
                >
                    <Info/>
                </IconButton>
                
            </div>
        </div>
    )
}
