import { MenuItem, Typography } from '@material-ui/core';
import { AccessAlarm, AddAlarm, Apps, ArrowDropDown, Attachment, AttachMoney, AvTimer, CalendarToday, CheckBox, CropFree, FindInPage, FormatListNumbered, FormatSize, Functions, Grade, Group, HourglassFull, Link, Person, PersonAdd, Phone, RadioButtonChecked, SettingsApplications, Share, ShortText, Timelapse } from '@material-ui/icons';
import React from 'react'
import {post, attribute} from '../../types/post';
import {space} from '../../types/space';

interface AttributeIconProps {
    attribute: attribute,
    style?: React.CSSProperties
}

const AttributeIcon = (props: AttributeIconProps) => {
    const {attribute, style} = props;
    switch(attribute.type) {
        case 'Title': 
            return <FormatSize style={style} />;
        case 'Text': 
            return <ShortText style={style} />;
        case 'Number': 
            return <Typography>123</Typography>;
        case 'Space': 
            return <Group/>
        case 'Select': 
            return <ArrowDropDown style={style} />;
        case 'Tags': 
            return <Typography style={{...style, marginLeft: 5}} variant="h6">#</Typography>;
        case 'Multi-select': 
            return <FormatListNumbered style={style} />;
        case 'Date': 
            return <CalendarToday style={style} />;
        case 'Person': 
            return <Person style={style} />;
        case 'Attachment': 
            return <Attachment style={style} />;
        case 'Checkbox': 
            return <CheckBox style={style} />;
        case 'URL': 
            return <Link style={style} />;
        case 'Email': 
            return <Typography style={style}>@</Typography>;
        case 'Phone': 
            return <Phone style={style} />;
        case 'Currency': 
            return <AttachMoney style={style} />;
        case 'Percent': 
            return <Typography style={style}>%</Typography>;
        case 'Duration': 
            return <Timelapse style={style} />;
        case 'Rating': 
            return <Grade style={style} />;
        case 'Formula': 
            return <Functions style={style} />;
        case 'Relation': 
            return <Share style={style} />;
        case 'Rollup': 
            return <ShortText style={style} />;
        case 'Lookup': 
            return <FindInPage style={style} />;
        case 'Count': 
            return <Apps style={style} />;
        case 'Barcode': 
            return <CropFree style={style} />;
        case 'Button': 
            return <RadioButtonChecked style={style} />;
        case 'Autonumber': 
            return <FormatListNumbered style={style} />;
        case 'Created Time': 
            return <AddAlarm style={style} />;
        case 'Created By': 
            return <PersonAdd style={style} />;
        case 'Last Edited Time': 
            return <AccessAlarm style={style} />;
        case 'Last Edited By': 
            return <SettingsApplications style={style} />;
        default:
            return <ShortText style={style} />
    }
}

export default AttributeIcon;