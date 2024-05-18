import graphql from 'babel-plugin-relay/macro';
import React, { CSSProperties, Fragment } from 'react';
import { usePreloadedQuery } from 'react-relay';
import { useHistory, useParams } from 'react-router';
import Dialog from '../Shared/Dialog';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';
import Typography from '../Shared/Typography';
import Wiki, { WikiProps } from '../Wiki/Wiki';
import WikiSidebar, { WikiSidebarProps } from '../Wiki/WikiSidebar';
import { SpaceWikiQuery } from './__generated__/SpaceWikiQuery.graphql';

interface SpaceWikiProps {
    queryRef: any,
    postId: string,
    mode?: 'sidebar' | 'menu',
    style?: CSSProperties
}

export default function SpaceWiki({queryRef, mode, style, ...props}: SpaceWikiProps & WikiProps & Omit<WikiSidebarProps, 'space'>) {
    const { space } = usePreloadedQuery<SpaceWikiQuery>(    
        graphql`      
            query SpaceWikiQuery($spaceId: Int!, $wikiCount: Int!, $wikiCursor: String) {        
                space(spaceId: $spaceId) {
                    spaceId
                    ...WikiSidebarFragment
                }
            }    
        `,    
        queryRef
    );

    mode = mode ? mode : 'menu'

    return (
        <div style={style}>
            {
                mode === 'menu' ? 
                <Fragment>
                    <MaxWidthWrapper
                        width={800}
                    >
                        <WikiSidebar
                            {...props}
                            space={space}
                        />
                    </MaxWidthWrapper>
                    <Dialog
                        open={!!props.postId}
                        onClose={() => props.openPage('')}
                        fullWidth
                        maxWidth={'md'}
                    >
                       <Wiki
                            {...props}
                            style={{minHeight: '90vh'}}
                        />
                    </Dialog>
                </Fragment>
                :
                <Fragment>
                    Menu Variant
                </Fragment>
            }
        </div>
    )
}
