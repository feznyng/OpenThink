import { CircularProgress } from '@mui/material'

export default function Loader() {
    return (
        <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <CircularProgress/>
        </div>
    )
}
