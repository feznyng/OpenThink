import { ReactElement } from "react";

export interface page {
    title?: string,
    fallback: ReactElement,
    props?: any,
    width?: number | string,
    Page: any,
    queryRef?: any
};