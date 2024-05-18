import axios from "axios";
import {baseURL} from './index';
import store from '../Store';
import {space} from '../types/space';
import {section} from '../types/post';


export const getSections = async (parent: space) => {
  try {
    const response = await axios.get(
      baseURL + `spaces/${parent.space_id}/sections`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
}

export const createSection = async (parent: space, section: section) => {
  
    try {
      const response = await axios.post(
        baseURL + `spaces/${parent.space_id}/sections`,
        section,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
  
      return response.data;
    } catch (e) {
  
    }
};

export const updateSection = async (parent: space, section: section) => {
    let sectionID = section.section_id;
    try {
      const response = await axios.patch(
        baseURL + `spaces/${parent.space_id}/sections/${sectionID}`,
        section,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
  
      return response.data;
    } catch (e) {
  
    }
};

export const updateSectionOrder = async (parent: space, sections: section[]) => {
  
    try {
      const response = await axios.patch(
        baseURL + `spaces/${parent.space_id}/sections`,
        sections,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
      )
  
      return response.data;
    } catch (e) {
  
    }
};

export const deleteSection = async (parent: space, sectionID: number) => {
  try {
    const response = await axios.delete(
      baseURL + `spaces/${parent.space_id}/sections/${sectionID}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${store.getState().userActions.jwt}` } }
    )

    return response.data;
  } catch (e) {

  }
};
