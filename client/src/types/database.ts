import { CSSProperties } from "@material-ui/core/styles/withStyles"
import { ReactElement } from "react"
import { DropResult } from "react-beautiful-dnd"
import { GroupProps } from "../components/DatabaseViews/Group"
import { RootState } from "../Store"

export interface Sort {
    attributeName: string,
    ascending: boolean
}

export type FilterType = 'Contains' | 'Does not contain' | 'Is Empty' | 'Is not empty' | ''

export interface Filter {
    or: boolean,
    attributeName: string,
    type: FilterType,
    dateValue: Date,
    arrValue: string[],
    stringValue: string
}

export interface View {
    filters: Filter[],
    sorts: Sort[]
}

export interface AttributeValue {
    value: any,
    attributeId?: string
}

export interface AttributeValueMap {
    [name: string]: AttributeValue
}

export interface AttributeOption {
    color?: string
    value: string
    image?: string
}

export interface AttributeOptionMap {
    [name: string]: {
        color?: string 
        image?: string
    }
}

export interface GroupBy {
    attribute: Attribute, 
    descending?: boolean
}

export interface Attribute {
    type: string
    options?: AttributeOption[]
    description?: string
    name: string,
    id?: string,
    color?: string,
    isCoalition?: boolean
}

export interface Entry {
    id: string
    attributeValues: AttributeValueMap,
    subEntries?: string[],
    numSubEntries?: number,
    numSubEntriesCompleted?: number,
    selected?: boolean
}

export interface Group {
    id: string
    color?: string
    deleted?: boolean
    attribute: Attribute
    attributeValue: AttributeValue,
    groupIds?: string[]
    entryIds: string[]
    count: number,
    defaultGroup?: boolean
}

export type AddEntry = (location: 'top' | 'bottom' | number, group?: Group | null, entry?: Entry) => void
export type DeleteEntry = (entry: Entry, groupId?: string) => void

export interface EntryViewProps {
    style?: CSSProperties
    completable?: boolean
    makeSelectEntry: () => (state: RootState, entryId: string) => Entry
    entryId: string
    attributes: Attribute[]
    deleteEntry: DeleteEntry
    openEntry: (entry: Entry, groupId?: string) => void
    addEntry: AddEntry
    changeAttributeValue: (entryId: string, attributeName: string, value: any, groupId: string | undefined) => void,
    groupId?: string,
    showButton?: boolean,
    dragHandleProps?: any
    showSubEntries?: boolean,
    fetchSubEntries?: (entry: Entry) => void,
    hideHoverActions?: boolean,
    hideAttributes?: boolean
}


export interface DatabaseViewProps {
    style?: CSSProperties

    attributes: Attribute[]
    groupIds?: string[],
    groupIdOverride?: string,
    entryIds?: string[],

    canAddAttribute: boolean
    canAddGroup?: boolean
    canAddEntry?: boolean

    addGroup?: (location: 'top' | 'bottom' | number, attributeValue: AttributeValue) => void
    addEntry: AddEntry
    deleteEntry: DeleteEntry

    onDragEnd: (result: DropResult) => void

    reorderAttribute?: (entry: Entry, index: number) => void
    addAttribute?: () => void,
    deleteAttribute?: (attribute: Attribute) => void

    groupViewProps?: Omit<GroupProps, "EntryItem" | "groupId" | "expanded" | "AddListItem" | "dragHandleProps" | "canAddEntry" | "entryViewProps" | "addEntry">

    expandedGroups?: string[]

    entryViewProps: Omit<EntryViewProps, "entryId" | "attributes" | "deleteEntry" | "addEntry">

    addEntryText?: string,

    addGroupButton?: ReactElement

    requireEntry?: boolean

    AddListItem?: any,
    AddEntry?: any
    defaultGroup?: Group

}