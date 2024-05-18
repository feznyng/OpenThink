import { TaskViewProps } from "../../types/task";
import { DatabaseViewProps } from '../../types/database';
import List from "../DatabaseViews/ListView";
import Button from "../Shared/Button";

export default function TaskList({style, ...props}: DatabaseViewProps & {style?: React.CSSProperties}) {

  return (
      <div
        style={style}
      >
          <List
              {...props}
          />
      </div>
  )
}
