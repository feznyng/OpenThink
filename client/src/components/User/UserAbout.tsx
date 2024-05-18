import React from 'react';
import SkillsCard from './SkillsCard';
import InterestsCard from './InterestsCard';
import { useFragment, usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { UserAboutQuery } from './__generated__/UserAboutQuery.graphql';

interface UserAboutProps {
  queryRef: any
}

export default function UserAbout({queryRef}: UserAboutProps) {
  const {user} = usePreloadedQuery<UserAboutQuery>(
    graphql`
        query UserAboutQuery($userId: ID!, $skillCount: Int!, $skillCursor: String) {
            user(userId: $userId) {
              userId
              ...SkillsCardFragment
              ...InterestsCardFragment
            }
        }
    `,
    queryRef
)

  return (
    <div style={{display: 'flex', justifyContent: 'center', height: '100%'}}>
        <div style={{maxWidth: 900, width: '100%'}}>

          <div>
            <SkillsCard
              user={user}
              expanded
              editable
            />  
            <InterestsCard
              style={{marginTop: 15}}
              user={user}
              expanded
              editable
            />
          </div>
        </div>
    </div>
  )
}