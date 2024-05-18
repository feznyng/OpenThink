import React from 'react';
import { useFragment, useMutation } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import FormChoice from '../Form/FormChoice';
import { FormOption } from '../Form/ChoiceSelector';
import PollSelector from './PollSelector';
import { useTheme } from '@material-ui/core';
import { PollFeatureMutation } from './__generated__/PollFeatureMutation.graphql'
/**
 * TODO: 
 * - Render options
 * - Accept user input as attribute_values
 */

interface PollFeatureProps {
    post: any
}

export default function PollFeature({post}: PollFeatureProps) {
    const {id, title, postId, poll} = useFragment(
        graphql`
            fragment PollFeatureFragment on Post {
                title
                postId
                id
                poll {
                    id
                    attribute {
                        options
                        type
                        attributeId
                    }
                    total
                    selectedOption
                    selectedOptions
                    options {
                        __typename
                        value
                        votes
                    }
                    ...PollSelectorFragment
                }

            }
        `,
        post
    )

    const [commitVotePost] = useMutation<PollFeatureMutation>(
        graphql`
            mutation PollFeatureMutation($input: PollVoteInput!) {
                votePoll(input: $input) {
                    attributeValueId
                    multiTextValue
                }
            }
        `
    )
    const attribute = poll?.attribute
    const theme = useTheme()
    const darkMode = theme.palette.type === 'dark'

    let options: {option: string, proportion: number, selected: boolean, highest: boolean}[] = []

    if (attribute) {
        const total = poll.total
        let largest = 0
        options = attribute.options.map(({option}: any) => {
            const optionValue = poll.options.find((opt: any) => opt.value == option)
            const proportion = optionValue ? optionValue.votes / total : 0
            if (proportion > largest) largest = proportion
            const selected = !!(poll.selectedOption === option || (poll.selectedOptions && poll.selectedOptions.includes(option)))
            return {option, proportion, selected}
        })
        options = options.map(opt => ({
            ...opt,
            highest: opt.proportion !== 0 && opt.proportion >= largest
        }))
    }

    const onSelect = (option: FormOption) => {
        let removed = poll.selectedOptions?.includes(option.option)
        commitVotePost({
            variables: {
                input: {
                    postId,
                    attributeId: poll.attribute.attributeId,
                    selected: option.option,
                    attributeType: poll.attribute.type,
                }
            },
            updater: (store) => {
                // find poll from post
                const pollRecord = store?.get(poll.id)
                // update total vote
                const selectedOptions = poll.selectedOptions
                if (poll.attribute.type === 'Select') {
                    let newTotal = pollRecord?.getValue("total") as number
                    if (!newTotal) newTotal = 0
                    if (removed) {
                        newTotal -= 1
                    } else if (!selectedOptions || selectedOptions.length === 0) {
                        newTotal += 1
                    }
                    pollRecord?.setValue(newTotal, "total")
                } else {
                    let newTotal = pollRecord?.getValue("total") as number
                    if (!newTotal) newTotal = 0
    
                    if (removed) {
                        newTotal -= 1
                    } else {
                        newTotal += 1
                    }
    
                    pollRecord?.setValue(newTotal, "total")
                }

               

                // update selected options
                const payload = store.getRootField("votePoll")
                const multiTextValue = payload.getValue("multiTextValue")
                pollRecord?.setValue(multiTextValue as string[], "selectedOptions")
                
                // update options value
                const options = pollRecord?.getLinkedRecords("options")
                // iterate through options to find the one with the same value as option.option
                let updatedOption = options?.find(opt => opt.getValue("value") === option.option)
                if (updatedOption) {
                    // either decrement or increment count
                    let votes = updatedOption.getValue("votes") as number
                    votes = votes ? votes : 0
                    votes = removed ? votes - 1 : votes + 1
                    updatedOption.setValue(votes, "votes")
                } else {
                    // if none exists this means this is the first vote for that option so create one
                    const createdOption = store.create(`poll-option-${option.option}`, 'PollOption')
                    createdOption.setValue(option.option, "value")
                    createdOption.setValue(1, "votes")

                    const newOptions = [createdOption];
                    if (options) {
                        newOptions.unshift(...options)
                    }


                    pollRecord?.setLinkedRecords(newOptions, 'options');
                }

                if (poll.attribute.type === 'Select' && !removed) {
                    // check if there was an existing selectedOptions
                    if (selectedOptions && selectedOptions.length > 0) {
                        const prevOption = selectedOptions[0]
                        updatedOption = options?.find(opt => opt.getValue("value") === prevOption)
                        if (updatedOption) {
                            updatedOption.setValue((updatedOption.getValue("votes") as number) - 1, "votes")
                        }
                    }
                }
            }
        })
    }

    return (
        <div>
            {
                poll && attribute && 
                <div>
                    {
                        (poll.selectedOption || poll.selectedOptions) ?
                        <div>
                            <FormChoice
                                options={options}
                                type={attribute.type}
                                onSelect={onSelect}
                                choiceProps={{
                                    variant: "poll",
                                    style: {marginBottom: 10}
                                }}
                            />
                            {poll.total ? poll.total : 0} {poll.total === 1 ? `vote` : `votes`} 
                        </div>
                        :
                        <div>
                            <PollSelector
                                poll={poll}
                                onSelect={onSelect}
                            />
                        </div>
                    }
                </div>
            }
            
        </div>
    )
}
