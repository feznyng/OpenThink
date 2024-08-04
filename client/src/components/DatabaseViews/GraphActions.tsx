import { AddCircle, Close, ImportExport } from "@material-ui/icons";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import React, {
  CSSProperties,
  Fragment,
  MouseEvent,
  useRef,
  useState,
} from "react";
import { useFragment, useMutation } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { GraphActionsMutation } from "./__generated__/GraphActionsMutation.graphql";
import Dialog from "../Shared/Dialog";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
} from "@material-ui/core";
import Button from "../Shared/Button";
import TextField from "../Shared/TextField";
import { GraphActionsCreateNodeMutation } from "./__generated__/GraphActionsCreateNodeMutation.graphql";
import { GraphActionsCreateLinkMutation } from "./__generated__/GraphActionsCreateLinkMutation.graphql";
import { AddLink, People } from "@mui/icons-material";
import PostAutocomplete from "../Post/PostAutocomplete";
import { Node, Edge } from "./GraphView";
import { GraphActionsCreateRelationMutation } from "./__generated__/GraphActionsCreateRelationMutation.graphql";
import { parseInt } from "lodash";

const actions = [
  {
    icon: <ImportExport />,
    name: "Import",
  },
  {
    icon: <AddCircle />,
    name: "Add Coalition",
  },
  {
    icon: <People />,
    name: "Add Group",
  },
  {
    icon: <AddLink />,
    name: "Add Edge",
  },
];

interface GraphActionsProps {
  style?: CSSProperties;
  space: any;
  type?: string;
  onCreateNode: (post: any) => void;
  onCreateEdge: (edge: { post1Id: number; post2Id: number }) => void;
  onImport?: () => void;
  postId?: number;
  nodes: Node[];
  links: Edge[];
}

export default function GraphActions({
  style,
  space,
  onImport,
  postId,
  onCreateNode,
  onCreateEdge,
  nodes,
}: GraphActionsProps) {
  const { spaceId } = useFragment(
    graphql`
      fragment GraphActionsFragment on Space {
        spaceId
      }
    `,
    space ? space : null,
  );

  const [state, setState] = useState({
    creatingType: -1,
    nodeTitle: "",
    post1: "",
    post2: "",
    message: "",
  });

  const [coalitions, setCoalitions] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);

  const fileRef = useRef();
  const menuAction = (e: MouseEvent, action: string) => {
    setCoalitions([]);
    setGroups([]);
    switch (action) {
      case "Import":
        (fileRef.current as any)?.click();
        break;
      case "Add Group":
        setState({
          ...state,
          creatingType: 0,
        });
        break;
      case "Add Coalition":
        setState({
          ...state,
          creatingType: 1,
        });
        break;
      case "Add Edge":
        setState({
          ...state,
          creatingType: 2,
        });
        break;
    }
  };

  const [commitImportPosts] = useMutation<GraphActionsMutation>(graphql`
    mutation GraphActionsMutation($input: ImportPostFileInput!) {
      importPostFile(input: $input)
    }
  `);

  const uploadFile = (e: any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      commitImportPosts({
        variables: {
          input: {
            spaceId,
            file,
            postId,
          },
        },
        uploadables: {
          file,
        },
        onCompleted: () => onImport && onImport(),
      });
    }
  };

  const [commitCreateNode] = useMutation<GraphActionsCreateNodeMutation>(
    graphql`
      mutation GraphActionsCreateNodeMutation($input: PostInput!) {
        createPost(input: $input) {
          postEdge {
            node {
              id
              postId
              title
              icon
              type
            }
          }
        }
      }
    `,
  );

  const [commitCreateRelation] =
    useMutation<GraphActionsCreateRelationMutation>(graphql`
      mutation GraphActionsCreateRelationMutation(
        $input: CreateRelationInput!
      ) {
        createRelation(input: $input) {
          postEdge {
            node {
              postId
            }
          }
        }
      }
    `);

  const createNode = () => {
    commitCreateNode({
      variables: {
        input: {
          title: state.nodeTitle,
          type: state.creatingType === 0 ? "Group" : "Coalition",
          spaces: [{ spaceId, current: true, parentPostId: postId }],
        },
      },
      onCompleted: (resp) => {
        const newPost = resp.createPost?.postEdge?.node;

        if (!coalitions.length) {
          newPost && onCreateNode(newPost);
        }

        coalitions.forEach((id, i) => {
          console.log("creating link from", id, "to", newPost?.postId);
          const parentPostId = parseInt(id);

          commitCreateRelation({
            variables: {
              input: {
                postId: newPost?.postId!!,
                parentPostId,
                spaceId,
              },
            },
            onCompleted: (resp) => {
              if (i === coalitions.length - 1) {
                const post2Id = resp.createRelation?.postEdge?.node?.postId;
                post2Id &&
                  onCreateEdge({ post1Id: parentPostId, post2Id: post2Id });
              }
            },
          });
        });
      },
      onError: () => {
        setState({
          ...state,
          message: "Could not create this post",
        });
      },
    });
    setState({
      ...state,
      creatingType: -1,
      nodeTitle: "",
    });
  };

  const [commitCreateEdge] = useMutation<GraphActionsCreateLinkMutation>(
    graphql`
      mutation GraphActionsCreateLinkMutation($input: CreateLinkInput!) {
        createLink(input: $input) {
          relation {
            post1Id
            post2Id
          }
        }
      }
    `,
  );

  const createEdge = () => {
    const postId = parseInt(groups[0]);
    const parentPostId = parseInt(coalitions[0]);

    if (!postId || !parentPostId) {
      console.log("createEdge - id not valid canceling");
      return;
    }

    commitCreateRelation({
      variables: {
        input: {
          postId,
          parentPostId,
          spaceId,
        },
      },
      onCompleted: (resp) => {
        const post2Id = resp.createRelation?.postEdge?.node?.postId;
        post2Id && onCreateEdge({ post1Id: parentPostId, post2Id: postId });
      },
    });
  };

  const handleClose = () => {
    setState({
      ...state,
      message: "",
    });
  };

  return (
    <Fragment>
      <SpeedDial
        ariaLabel="Graph Actions"
        icon={<SpeedDialIcon />}
        style={{ ...style, zIndex: 1000 }}
      >
        {actions.reverse().map((action) => (
          <SpeedDialAction
            key={action.name}
            tooltipOpen
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={(e) => menuAction(e, action.name)}
          />
        ))}
      </SpeedDial>
      <Dialog
        open={state.creatingType === 0 || state.creatingType === 1}
        onClose={() => setState({ ...state, creatingType: -1 })}
      >
        <DialogTitle>
          Create {state.creatingType === 0 ? "Group" : "Coalition"}
        </DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: 15 }}>
            {state.creatingType === 0 && (
              <PostAutocomplete
                posts={nodes.filter(({ type }) => type === "Coalition")}
                placeholder="Select Coalitions"
                onChange={(posts) => setCoalitions(posts.map(({ id }) => id))}
              />
            )}
          </div>
          <TextField
            onChange={(e) => setState({ ...state, nodeTitle: e.target.value })}
            placeholder={
              state.creatingType === 0 ? "Group Name" : "Coalition Name"
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setState({
                ...state,
                creatingType: -1,
              })
            }
          >
            Cancel
          </Button>
          <Button color="primary" variant="contained" onClick={createNode}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={state.creatingType === 2}
        onClose={() => setState({ ...state, creatingType: -1 })}
      >
        <DialogTitle>Create Link</DialogTitle>
        <DialogContent>
          <PostAutocomplete
            posts={nodes.filter(({ type }) => type === "Coalition")}
            placeholder="Select Coalition"
            onChange={(posts) => setCoalitions(posts.map(({ id }) => id))}
            style={{ marginBottom: 10 }}
          />
          <PostAutocomplete
            posts={nodes.filter(({ type }) => type === "Group")}
            placeholder="Select Group"
            onChange={(posts) => setGroups(posts.map(({ id }) => id))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState({ ...state, creatingType: -1 })}>
            Cancel
          </Button>
          <Button color="primary" variant="contained" onClick={createEdge}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <input
        accept=".csv,"
        style={{ display: "none" }}
        onChange={uploadFile}
        type="file"
        ref={fileRef as any}
      />
      <Snackbar
        open={state.message.length > 0}
        autoHideDuration={6000}
        onClose={handleClose}
        message={state.message}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </Fragment>
  );
}
