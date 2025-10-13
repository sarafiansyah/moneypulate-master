import { ReactNode } from "react";

export interface AppMenuItem {
    key: string;
    icon: ReactNode;
    label: string;
    path: string;
}
