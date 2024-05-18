import React from 'react'
import {updatePost} from '../../../../actions/postActions';
import {useDispatch} from 'react-redux';
import store from '../../../../Store';
export default function PollFeature(props) {
    const {post} = props;
    const [info, setInfo] = React.useState(post.info);
    const [pollAnswers, setPollAnswers] = React.useState(post.info.poll);
    const currUser = store.getState().userActions.userInfo;
    const dispatch = useDispatch();
    React.useEffect(() => {
        if (post.info) {
            setPollAnswers(post.info.poll)

        }
    }, [post.info])
    const handleVote = voteAnswer => {
        if (!currUser) {
            return;
        }
        const newPollAnswers = pollAnswers.map(answer => {
          if (answer.option === voteAnswer) answer.votes++;
          return answer;
        })
        setPollAnswers(newPollAnswers);
        dispatch(updatePost({
            ...post, 
            info: {
                poll: pollAnswers, 
                users: [...(info.users ? info.users : []), {user_id: currUser.user_id, option: voteAnswer}]
            }
        }));
      }
    return (
        <div>
        </div>
    )
}
