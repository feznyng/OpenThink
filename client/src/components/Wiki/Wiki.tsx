import React, { CSSProperties, Suspense } from 'react'
import { loadQuery, useFragment, useQueryLoader } from 'react-relay'
import WikiDrafts from './WikiDrafts'
import WikiHome from './WikiHome'
import WikiPostView from './WikiPostView'
import WikiPostViewQuery from './__generated__/WikiPostViewQuery.graphql';
import SuspenseLoader from '../Shared/SuspenseLoader';

export type WikiViews = 'home' | 'drafts' | 'templates' | 'content-map' | 'post' | undefined

export interface WikiProps {
    viewing?: WikiViews,
    postId: string,
    style?: CSSProperties
}

export default function Wiki({viewing, style, postId}: WikiProps) {
  const [
      wikiQueryRef,
      loadWikiPost
  ] = useQueryLoader(
      WikiPostViewQuery
  )

  React.useEffect(() => {
      if (postId) {
          loadWikiPost({postId}, {fetchPolicy: 'network-only'})
      }
  }, [postId])

  return (
    <div style={{height: '100%', width: '100%', ...style}}>
      {
          (!viewing || viewing === 'home') &&
          <WikiHome
              
          />
      }
      {
          viewing === 'drafts' &&
          <WikiDrafts
              
          /> 
      }
      {
          viewing === 'post' &&
          <SuspenseLoader
              queryRef={wikiQueryRef}
              fallback={<div/>}
          >
              <WikiPostView
                  queryRef={wikiQueryRef}
              /> 
          </SuspenseLoader>
      }
    </div>
  )
}