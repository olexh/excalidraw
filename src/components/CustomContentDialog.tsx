import React from "react";

import { AppState } from "../types";
import { Dialog } from "./Dialog";

import "./ExportDialog.scss";

export const CustomDialog = ({
  title,
  appState,
  setAppState,
  children,
}: {
  title: string;
  appState: AppState;
  setAppState: React.Component<any, AppState>["setState"];
  children: React.ReactNode | React.ReactNode[];
}) => {
  const handleClose = React.useCallback(() => {
    setAppState({ openDialog: null });
  }, [setAppState]);

  return (
    <>
      {appState.openDialog === "custom" && (
        <Dialog onCloseRequest={handleClose} title={title}>
          {children}
        </Dialog>
      )}
    </>
  );
};
