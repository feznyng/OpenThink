import React, {Component} from 'react';
import {getSections} from '../../actions/sectionActions'
import {Dialog, DialogContent, DialogActions, Button, CircularProgress, Tabs, Tab, withStyles, div, Card} from '@material-ui/core';
import {getParentPosts} from '../../actions/orgActions';
import PostEditor from '../Post/Editor/PostEditor';
import {createPost} from '../Post/PostCreatorOld'
import PostNotifications from '../Post/PostNotifications'
import PostView from '../Post/PostView';
import {connect} from 'react-redux';
import { updatePost } from '../../actions/postActions';
import { createSection, updateSection, deleteSection, updateSectionOrder } from '../../actions/sectionActions';
import { updateTaskOrder } from '../../actions/relationActions';
import { completePost, deleteRelation, removePost } from '../../actions/postActions';
import KanbanBoard from './KanbanBoard';
import TaskList from './List';
import TaskCalendar from './TaskCalendar';
import Sticky from 'react-sticky-el';

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const styles = (theme) => ({
    tab: {
        maxWidth: 100,
        minWidth: 100,
        width: 100,
        height: 50,
        padding: 0,
        margin: 0,
        textTransform: 'none'
    },
    indicator: {
        bottom: 0
    },
})

export class Tasks extends Component {
    constructor(props) {
        super(props);
        this.originalNewPost = {
            title: '',
            body: '',
            spaces: [{...this.props.parent, parent_post: this.props.post}],
            type: 'Task',
            info: {},
            users: [],
            due_date: null,
            hidden: true,
        };
        this.state = {
            sections: [],
            tasks: [],
            newPost: this.originalNewPost,
            items: [],  
            view: 0,
        }
        this.imageMap = new Map();
        this.postMap = new Map();
        this.taskRef = React.createRef();

        this.executeScroll = () => {
            console.log('here')
            window.scrollTo({
                behavior: "smooth",
                top: (this.taskRef.current.offsetTop - 100)
            });
        }
        this.createTask = () => {
            this.setState({...this.state, creating: true}, () => {
                createPost(this.state.newPost, this.props.parent, this.imageMap, this.state.notifications, this.props.makeRelation, ({type, e}) => {
                    const p = {...this.state.newPost, ...e.target, post_owner_id: this.props.userInfo.user_id};
                    this.postMap.set(p.post_id, p);

                    let index = - 1;
                    let section;
                    this.state.items.forEach((s, i) => {
                        if (s.section_id === this.state.section_id) {
                            index = i
                            section = s;
                        }
                    })

                    if (!section)
                        section = this.state.items[0];

                    section.subTasks = [...section.subTasks, p];

                    const newItems = [...this.state.items.slice(0, index), section, ...this.state.items.slice(index + 1, this.state.items.length)];

                    this.setState({
                        ...this.state, 
                        creating: false,
                        newPost: this.originalNewPost,
                        open: false,
                        tasks: [...this.state.tasks, p],
                        items: newItems,
                    });
                });
            })
        }

        this.actionHandler = (item, type) => {

            switch (type) {
                case 'deleteRelation': {
                    this.props.deleteRelation(this.props.parent.project_id ? 'projects' : 'spaces', item.relation_id)
                    break;
                }
                case 'deletePost': {
                    this.props.removePost(this.props.currSpace, item)

                    let section;
                    let index = -1;
                    this.state.items.forEach((s, i) => {
                        if (s.section_id === this.state.section_id) {
                            index = i
                            section = s;
                        }
                    })
                    
                    if (!section)
                        section = this.state.items[0];

                    section.subTasks = section.subTasks.filter(t => t.post_id !== item.post_id)

                    const newItems = [...this.state.items.slice(0, index), section, ...this.state.items.slice(index + 1, this.state.items.length)];

                    this.setState({
                        ...this.state, 
                        creating: false,
                        newPost: this.originalNewPost,
                        open: false,
                        tasks: this.state.tasks.filter(t => t.post_id !== item.post_id),
                        items: newItems,
                    });
                    break;
                }
                case 'editPost': {
                    this.onClickPost(item);
                    break;
                }
            }
          }
          this.setupSection = () => {
            const sectionMap = new Map();
            sectionMap.set(-1, {
                section_id: -1,
                name: "Default",
                subTasks: [],
                default: true,
            });
            this.state.sections.sort((b1, b2) => b1.index - b2.index).forEach(b => {
              sectionMap.set(b.section_id, {
                section_id: b.section_id,
                name: b.name,
                subTasks: [],
                color: b.color,
              });
            })
            
      
            if (this.state.tasks) {
              this.state.tasks.forEach((t) => {
                if (!t.section_id) {
                    const section = sectionMap.get(-1);
                    sectionMap.set(-1, {
                      ...section,
                      subTasks: [
                        ...section.subTasks,
                        t
                      ]
                    });
                } else {
                  const section = sectionMap.get(t.section_id);
                  sectionMap.set(t.section_id, {
                    ...section,
                    subTasks: [
                      ...section.subTasks,
                      t
                    ]
                  })
                }
                
              });
      
              
            }
      
            const sections = [];
      
            sectionMap.forEach(e => {
              sections.push({...e, subTasks: e.subTasks.sort((s1, s2) => s1.index - s2.index)});
            });  
                  
            this.setState({
                ...this.state,
                width: this.props.width === 'xs' || this.props.width === 'sm' ? this.state.items.length * 300 : '',
                items: sections
            });
          }
      
          this.createNewSection = () => {
              const newSection = {
                root: false,
                name: "Section " + (this.state.items.length + 1).toString(),
                color: '#D3D3D3',
                subTasks: [],
                index: this.state.items.length - 1
              }
              createSection(this.props.parent, newSection).then(e => {
                this.setState({
                  ...this.state,
                  items: [
                      ...this.state.items,
                      {
                          section_id: e.section_id,
                          name: "Section " + (this.state.items.length + 1).toString(),
                          subTasks: [],
                          currSection: e.section_id,
                          editing: true
                      }
                  ],
                  anchorEl: null,
              });
              })
              
          };

            this.findSection = (section_id) => {
                let section = null;
                let index = -1;
                this.state.items.some((e, i) => {
                    if (e.section_id === section_id) {
                        index = i;
                        section = e;
                        return true;
                    } 
                    return false;
                });
                return {section, index}
            }
      
          this.changeSectionColor = (section_id, color) => {
              const {section, index} = this.findSection(section_id);

              if (color && color.hex) {
                section.color = color.hex;
                updateSection(this.props.parent, section);
                this.setState({
                  ...this.state,
                  items: [...this.state.items.slice(0, index), section, ...this.state.items.slice(index + 1, this.state.items.length)],
                  anchorEl: null,
                });
                
              } else {
                section.color = null;
                updateSection(this.props.parent, section);
                this.setState({
                  ...this.state,
                  items: [...this.state.items.slice(0, index), section,...this.state.items.slice(index + 1, this.state.items.length)],
                  anchorEl: null,
                });
              }
          };
      
          this.changeSectionName = (section_id, name) => {
            const {section, index} = this.findSection(section_id);

            if (section.name === name) {
              this.setState({
                ...this.state, 
                editing: false,
              });
              return;
            }
            section.name = name;
            updateSection(this.props.parent, section);
            this.setState({
              ...this.state, 
              editing: false,
              items: [...this.state.items.slice(0, index), section,...this.state.items.slice(index + 1, this.state.items.length)],
            })
          };
      
          this.deleteCustomSection = (section_id) => {
            const {section, index} = this.findSection(section_id);

            deleteSection(this.props.parent, section.section_id);
            const subItems = section.subTasks.map(s => {return {...s, section_id: null}});
            this.setState({
              ...this.state,
              items: [
                {
                ...this.state.items[0], 
                subTasks: [...this.state.items[0].subTasks, ...subItems]
                }, 
                ...this.state.items.slice(1, index), ...this.state.items.slice(index + 1, this.state.items.length)
              ],
              anchorEl: null,
              deleteOpen: false,
            }, () => updateTaskOrder(this.props.parent, this.state.items[0].subTasks));
          };
          
      
          this.onDragEnd = (result) => {
            if (!result.destination) {
              return;
            }
            const sourceIndex = result.source.index;
            const destIndex = result.destination.index;
            if (result.type === "droppableItem") {
              if (sourceIndex === destIndex || destIndex === 0 || destIndex === this.state.items.length - 1) {
                return;
              }
              const items = reorder(this.state.items, sourceIndex, destIndex);
              updateSectionOrder(this.props.parent, items.slice(1, this.state.items.length));
              this.setState({
                items
              });
              this.props.onSectionsChange('order', this.state.items)
            } else if (result.type === "droppableSubItem") {
                const itemSubItemMap = this.state.items.reduce((acc, item) => {
                  acc[item.section_id] = item.subTasks;
                  return acc;
                }, {});
        
              const sourceParentId = parseInt(result.source.droppableId);
              const destParentId = parseInt(result.destination.droppableId);
        
              const sourcesubTasks = itemSubItemMap[sourceParentId];
              const destsubTasks = itemSubItemMap[destParentId];
        
              let newItems = [...this.state.items];
        
              if (sourceParentId === destParentId) {
                const reorderedsubTasks = reorder(
                  sourcesubTasks,
                  sourceIndex,
                  destIndex
                );
                newItems = newItems.map(item => {
                  if (item.section_id === sourceParentId) {
                    item.subTasks = reorderedsubTasks;
                  }
                  return item;
                });
                updateTaskOrder(this.props.parent, reorderedsubTasks);
                this.setState({
                  ...this.state,
                  items: newItems,
                });
              } else {
                let newSourcesubTasks = [...sourcesubTasks];
                const [draggedItem] = newSourcesubTasks.splice(sourceIndex, 1);
                updateTaskOrder(
                  this.props.parent,
                  newSourcesubTasks.map(s => {return {...s, section_id: sourceParentId < 0 ? null : sourceParentId};})
                );

                let newDestsubTasks = [...destsubTasks];
                newDestsubTasks.splice(destIndex, 0, draggedItem);
                updateTaskOrder(
                  this.props.parent,
                  newDestsubTasks.map(s => {return {...s, section_id: destParentId < 0 ? null : destParentId};})
                );
                
                newItems = newItems.map(item => {
                  if (item.section_id === sourceParentId) {
                    item.subTasks = newSourcesubTasks;
                    item.subTasks.forEach((t, i) => {
                        t.section_id = item.section_id;
                        t.index = i;
                    });
                  } else if (item.section_id === destParentId) {
                    item.subTasks = newDestsubTasks;
                    item.subTasks.forEach((t, i) => {
                        t.section_id = item.section_id;
                        t.index = i;
                    });
                  }
                  return item;
                });
                this.setState({
                ...this.state,
                  items: newItems
                });
              }
            }
          }
        this.completePost = (post) => {
            completePost(this.props.parent, post.original_post_id, !post.completed);
            post.completed = !post.completed;
            this.setState({
                ...this.state, 
                tasks: [
                    ...this.state.tasks.filter(p => p.id !== post.post_id), 
                    post
                ],
                items: this.state.items
            })
        }

        this.onCreate = (e, subtasks) => {
            this.setState({
                ...this.state, 
                open: true,
                newPost: {
                    ...this.state.newPost,
                    section_id: e,
                    index: subtasks.length
                },
                section_id: e
            })
        }

        this.onClickPost = (e) => {
            this.setState({...this.state, viewID: e.post_id, section_id: e.section_id})
        }
    }

    componentDidMount() {
        this.setState({
            ...this.state,
            loading: true
        }, () => {
            getParentPosts(this.props.parent, {type: 'Task'}).then(posts => {
                posts.forEach(p => {
                    this.postMap.set(p.post_id, p);
                })
                getSections(this.props.parent).then((sections) => {
                    this.setState({
                        ...this.state,
                        tasks: posts,
                        sections: sections ? sections : [],
                        loading: false,
                    }, () => {
                        this.setupSection();
                    })
                })
               
            })
        })
    }

    render() {
        return (
            <div style={{marginTop: 20}}>
                <Sticky stickyStyle={{top: 57, zIndex: 1000}} topOffset={-57} onFixedToggle={(val) => this.setState({...this.state, fixed: val})}>
                    <Card>
                        <Tabs  
                            value={this.state.view} 
                            onChange={(e, i) => {
                                this.setState({
                                    ...this.state,
                                    view: i
                                });
                                this.executeScroll();
                            }} 
                            classes={{
                                indicator: this.props.classes.indicator
                            }}  
                            variant='scrollable'
                        >
                            <Tab classes={{ root: this.props.classes.tab}}  label="List" />
                            <Tab classes={{ root: this.props.classes.tab}}  label="Board" />
                            <Tab classes={{ root: this.props.classes.tab}}  label="Calendar" />
                        </Tabs>
                    </Card>
                </Sticky>
                <div ref={this.taskRef} style={{height: '100%'}}>
                    {
                        this.state.loading ? 
                        <CircularProgress/>
                        :
                        <Card style={{padding: (this.props.width === 'xs' || this.props.width === 'sm') ? 0 : 20, height: '100%'}}>
                            {
                                this.state.view === 1 && 
                                <KanbanBoard
                                    items={this.state.items}
                                    canChange={this.props.isMod}
                                    parent={this.props.parent}
                                    onCreate={this.onCreate}
                                    onClick={this.onClickPost}
                                    onComplete={this.completePost}
                                    actionHandler={this.actionHandler}
                                    createNewSection={this.createNewSection}
                                    changeSectionColor={this.changeSectionColor}
                                    changeSectionName={this.changeSectionName}
                                    editSectionName={this.editSectionName}
                                    deleteCustomSection={this.deleteCustomSection}
                                    onDragEnd={this.onDragEnd}
                                />
                            }
                            {
                                this.state.view === 0 && 
                                <TaskList
                                    items={this.state.items}
                                    canChange={this.props.isMod}
                                    parent={this.props.parent}
                                    onCreate={this.onCreate}
                                    onClick={this.onClickPost}
                                    onComplete={this.completePost}
                                    actionHandler={this.actionHandler}
                                    createNewSection={this.createNewSection}
                                    changeSectionColor={this.changeSectionColor}
                                    changeSectionName={this.changeSectionName}
                                    editSectionName={this.editSectionName}
                                    deleteCustomSection={this.deleteCustomSection}
                                    onDragEnd={this.onDragEnd}
                                />
                            }
                            {
                                this.state.view === 2 && 
                                <TaskCalendar
                                    tasks={this.state.tasks}
                                    canChange={this.props.isMod}
                                    currUser={this.props.currUser}
                                    parent={this.props.parent}
                                    onCreate={this.onCreate}
                                    onClick={this.onClickPost}
                                    onComplete={this.completePost}
                                    actionHandler={this.actionHandler}
                                    createNewSection={this.createNewSection}
                                    changeSectionColor={this.changeSectionColor}
                                    changeSectionName={this.changeSectionName}
                                    editSectionName={this.editSectionName}
                                    deleteCustomSection={this.deleteCustomSection}
                                    onDragEnd={this.onDragEnd}
                                />
                            }
                        </Card>
                    }
                </div>
                <Dialog open={this.state.open} onClose={() => this.setState({...this.state, open: false})}>
                    <DialogContent>
                        <div style={{minWidth: 500}}>
                            <PostEditor
                                lockedType={'Action Item'}
                                parent={{...this.props.parent}}
                                parentType={this.props.parent.project_id ? 'projects' : 'spaces'}
                                creating
                                mod={this.props.isMod}
                                options
                                hideSelector
                                imageChange={(key, value) => {
                                    this.imageMap.set(key, {read: false, url: value});
                                }}
                                onPostChange={(post) => 
                                    this.setState({
                                        ...this.state,
                                        newPost: post,
                                    })
                                }
                                finish={this.createTask}
                                newPost={this.state.newPost}
                            />
                        </div>
                    </DialogContent>
                    
                    <DialogActions>
                        <div style={{width: '100%', marginBottom: -10}}>
                            <div style={{float: 'left'}}>
                                <PostNotifications preview onChange={(val) => this.setNotifications(val)}/>
                            </div>

                            <div style={{float: 'right', display: 'flex', alignItems: 'center'}}>
                                {this.state.creating && <CircularProgress style={{marginRight: '10px'}} size={30} />}
                                <Button  
                                    disabled={this.state.newPost.title === ''} 
                                    onClick={this.createTask} 
                                    variant="contained" 
                                    style={{color: 'white'}} 
                                    color="primary" 
                                >
                                    Create
                                </Button>                   
                            </div>
                        </div>
                    </DialogActions>
                </Dialog>
                <Dialog open={Boolean(this.state.viewID)} onClose={() => this.setState({...this.state, viewID: null})}>
                    <DialogContent style={{width: '100%'}}>
                        <div style={{minHeight: '70vh', width: 500}}>
                            <PostView  
                                parent={this.props.parent}
                                parentID={this.props.parent.space_id}  
                                parentType={'organization'} 
                                postID={this.state.viewID}
                                visualization
                                onChange={({type, e}) => {
                                    if (e) {
                                        if (type === 'postDeletion' && e.post_id.toString() === this.state.viewID.toString()) {
                                            let section = this.state.items.find(i => i.section_id === e.section_id);
                                            if (!section) {
                                                section = this.state.items[0];
                                            }
                                            section.subTasks = [...section.subTasks.filter(t => t.post_id !== e.post_id)].sort((p1, p2) => p1.index - p2.index)
                                            this.setState({
                                                ...this.state, 
                                                tasks: this.state.tasks.filter(p => p.id !== e.post_id), 
                                                items: this.state.items,
                                                viewID: null,
                                            })
                                        }
                                        if (type === 'completePost') {
                                            let section = this.state.items.find(i => i.section_id === e.section_id);
                                        
                                            if (!section) {
                                                section = this.state.items[0];
                                            }
                                            section.subTasks = [...section.subTasks.filter(t => t.post_id !== e.post_id), e].sort((p1, p2) => p1.index - p2.index)
                                            this.setState({
                                                ...this.state, 
                                                tasks: [
                                                    ...this.state.tasks.filter(p => p.id !== e.post_id), 
                                                    e
                                                ],
                                                items: this.state.items
                                            })
                                        }
                                    }
                                    
                                }}
                                onPostClicked={(e) => {
                                    this.setState({
                                        ...this.state, 
                                        viewID: e.post_id,
                                        
                                    })
                                }}
                                onUpdate={(post) => {
                                    if (post.type === 'Task') {
                                        let section = this.state.items.find(i => i.section_id === post.section_id);
                                        
                                        if (!section) {
                                            section = this.state.items[0];
                                        }

                                        section.subTasks = [...section.subTasks.filter(t => t.post_id !== post.post_id), post].sort((p1, p2) => p1.index - p2.index)
                                        this.setState({
                                            ...this.state, 
                                            tasks: [
                                                ...this.state.tasks.filter(t => t.post_id !== post.post_id), 
                                                post
                                            ],
                                            items: this.state.items
                                        })
                                    }
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {...state.orgActions, ...state.userActions, ...state.uiActions};
}
  
const mapDispatchToProps = {
    updatePost,
    removePost
}
export default(connect(mapStateToProps, mapDispatchToProps) (withStyles(styles)(Tasks)))
