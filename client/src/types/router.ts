
/* /space/:spaceID/:spacePage?/:postID?/:subPage */
export interface SpaceViewParams {
  spaceID: string,
  spacePage: string,
  postID: string,
  subPage: string,
  viewId: string
}

export interface SpecialLinkParams {
  key: string | undefined
}