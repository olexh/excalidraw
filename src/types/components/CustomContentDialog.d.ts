import React from "react";
import { AppState } from "../types";
import "./ExportDialog.scss";
export declare const CustomDialog: ({ title, appState, setAppState, children, }: {
    title: string;
    appState: AppState;
    setAppState: React.Component<any, AppState>["setState"];
    children: React.ReactNode | React.ReactNode[];
}) => JSX.Element;
