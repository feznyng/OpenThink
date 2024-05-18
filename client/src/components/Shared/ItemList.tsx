import { CircularProgress } from '@material-ui/core';
import React, { ReactElement } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import ExpandButton from './ExpandButton';

interface ItemListProps {
    loadMore: () => void,
    hasMore: boolean,
    dataLength: number,
    variant?: 'infinite' | 'button',
    children: ReactElement[]
}

export default function ItemList({loadMore, hasMore, dataLength, children, variant}: ItemListProps) {
    const behavior = variant ? variant : 'infinite';

    return (
        <div>
            {
                behavior === 'infinite' ? 
                <InfiniteScroll
                    hasMore={hasMore}
                    loader={<CircularProgress/>}
                    dataLength={dataLength}
                    next={loadMore}
                    style={{overflow: 'hidden', maxWidth: '100%', paddingRight: 15}}
                >
                    {children}
                </InfiniteScroll>
                :
                <div>
                    {children}
                    {
                        hasMore && 
                        <ExpandButton
                            onClick={loadMore}
                        />
                    }
                </div>
            }
        </div>
    )
}
