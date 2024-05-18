import { projectTypes } from '../../utils/projectutils'
import ConfigOption from '../Shared/ConfigOption'
import { SpaceCreatorPage } from './SpaceCreator'

export default function CreateProjectTypeSelector({onChange, newSpace}: SpaceCreatorPage) {
    return (
        <div>
            {
                projectTypes.map(({title, comingSoon, Icon, ...pt}) => (
                    <ConfigOption
                        title={title}
                        {...pt}
                        icon={<Icon fontSize='large'/>}
                        onClick={() => onChange({...newSpace, projectType: title})}
                        checked={newSpace.projectType === title}
                        style={{marginTop: 10}}
                        disabled={comingSoon}
                    />
                ))
            }
        </div>
    )
}
