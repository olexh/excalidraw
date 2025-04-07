import React from "react";
import { AppState, Device, ExcalidrawProps } from "../types";
import { ActionManager } from "../actions/manager";
import { t } from "../i18n";
import Stack from "./Stack";
import { newTextElement, showSelectedShapeActions } from "../element";
import { NonDeletedExcalidrawElement } from "../element/types";
import { FixedSideContainer } from "./FixedSideContainer";
import { Island } from "./Island";
import { calculateScrollCenter } from "../scene";
import { SelectedShapeActions, ShapesSwitcher } from "./Actions";
import { Section } from "./Section";
import { SCROLLBAR_MARGIN, SCROLLBAR_WIDTH } from "../scene/scrollbars";
import { Stats } from "./Stats";
import { actionToggleStats } from "../actions";
import { useTunnels } from "./context/tunnels";
import { SidebarButton } from "./SidebarButton";
import Footer from "./footer/Footer";
import { DEFAULT_VERTICAL_ALIGN } from "../constants";
import { DateTextButton } from "./DateTextButton";

type MobileMenuProps = {
  appState: AppState;
  actionManager: ActionManager;
  renderLibrary?: boolean;
  onInsertElements: (elements: readonly NonDeletedExcalidrawElement[]) => void;
  renderSelectedShapeActions: () => React.ReactNode;
  renderJSONExportDialog: () => React.ReactNode;
  renderImageExportDialog: () => React.ReactNode;
  renderCustomDialog: () => React.ReactNode | null;
  setAppState: React.Component<any, AppState>["setState"];
  elements: readonly NonDeletedExcalidrawElement[];
  onLockToggle: () => void;
  onHandToolToggle: () => void;
  onPenModeToggle: () => void;
  canvas: HTMLCanvasElement | null;
  renderCustomSidebar?: ExcalidrawProps["renderSidebar"];
  toggleMenu: (
    type: "library" | "customSidebar" | "customBottombar",
    force?: boolean,
  ) => boolean;
  onImageAction: (data: { insertOnCanvasDirectly: boolean }) => void;
  renderTopLeftUI?: (
    isMobile: boolean,
    appState: AppState,
  ) => JSX.Element | null;
  renderCustomStats?: ExcalidrawProps["renderCustomStats"];
  renderSidebars: () => JSX.Element | null;
  device: Device;
  renderWelcomeScreen: boolean;
  showExitZenModeBtn: boolean;
};

export const MobileMenu = ({
  appState,
  elements,
  actionManager,
  setAppState,
  onLockToggle,
  onHandToolToggle,
  onPenModeToggle,
  canvas,
  onImageAction,
  renderTopLeftUI,
  renderCustomDialog,
  renderLibrary,
  renderCustomStats,
  renderSidebars,
  renderCustomSidebar,
  toggleMenu,
  device,
  renderWelcomeScreen,
  showExitZenModeBtn,
  renderSelectedShapeActions,
  onInsertElements,
}: MobileMenuProps) => {
  const { welcomeScreenCenterTunnel, mainMenuTunnel } = useTunnels();
  const renderToolbar = () => {
    return (
      <FixedSideContainer side="top" className="App-top-bar">
        {renderWelcomeScreen && <welcomeScreenCenterTunnel.Out />}
        <Section heading="shapes" className="mobile-top-section">
          {(heading: React.ReactNode) => (
            <Stack.Col gap={4} align="start" className="mobile-top-stack">
              <div className="top-left-stack">
                {renderTopLeftUI && renderTopLeftUI(true, appState)}
              </div>
              <Island padding={1} className="App-toolbar App-toolbar--mobile">
                {heading}
                <Stack.Row gap={1}>
                  <ShapesSwitcher
                    appState={appState}
                    canvas={canvas}
                    activeTool={appState.activeTool}
                    setAppState={setAppState}
                    onImageAction={({ pointerType }) => {
                      onImageAction({
                        insertOnCanvasDirectly: pointerType !== "mouse",
                      });
                    }}
                  />
                  <DateTextButton
                    onChange={() =>
                      onInsertElements([
                        newTextElement({
                          x: window.innerWidth / 2,
                          y: window.innerHeight / 2,
                          strokeColor: appState.currentItemStrokeColor,
                          backgroundColor: appState.currentItemBackgroundColor,
                          fillStyle: appState.currentItemFillStyle,
                          strokeWidth: appState.currentItemStrokeWidth,
                          strokeStyle: appState.currentItemStrokeStyle,
                          roundness: null,
                          roughness: appState.currentItemRoughness,
                          opacity: appState.currentItemOpacity,
                          text: new Date().toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }),
                          fontSize: appState.currentItemFontSize,
                          fontFamily: appState.currentItemFontFamily,
                          textAlign: appState.currentItemTextAlign,
                          verticalAlign: DEFAULT_VERTICAL_ALIGN,
                          locked: false,
                        }),
                      ])
                    }
                    title={t("toolBar.hand")}
                    isMobile
                  />
                  {actionManager.renderAction("toggleEditMenu")}
                  {renderCustomDialog !== null && (
                    <SidebarButton
                      onChange={() => setAppState({ openDialog: "custom" })}
                      title={t("toolBar.hand")}
                      isMobile
                    />
                  )}
                  {actionManager.renderAction("undo")}
                  {actionManager.renderAction("redo")}
                  {actionManager.renderAction("zoomOut")}
                  {actionManager.renderAction("zoomIn")}
                </Stack.Row>
              </Island>
              {/*<div className="mobile-misc-tools-container">
                  {!appState.viewModeEnabled && renderLibrary && (
                    <LibraryButton
                      appState={appState}
                      setAppState={setAppState}
                      isMobile
                    />
                  )}
                  <HandButton
                    checked={isHandToolActive(appState)}
                    onChange={() => onHandToolToggle()}
                    title={t("toolBar.hand")}
                    isMobile
                  />
                </div>*/}
            </Stack.Col>
          )}
        </Section>
        {/*<HintViewer
          appState={appState}
          elements={elements}
          isMobile={true}
          device={device}
        />*/}
      </FixedSideContainer>
    );
  };

  const renderAppToolbar = () => {
    if (appState.viewModeEnabled) {
      return (
        <div className="App-toolbar-content">
          <mainMenuTunnel.Out />
        </div>
      );
    }

    return (
      <div className="App-toolbar-content">
        <mainMenuTunnel.Out />
        {/*{actionManager.renderAction("toggleEditMenu")}*/}
        {/*{actionManager.renderAction("undo")}*/}
        {/*{actionManager.renderAction("redo")}*/}
        {/*{actionManager.renderAction(*/}
        {/*  appState.multiElement ? "finalize" : "duplicateSelection",*/}
        {/*)}*/}
        {/*{actionManager.renderAction("deleteSelectedElements")}*/}
      </div>
    );
  };

  return (
    <>
      {renderSidebars()}
      {!appState.viewModeEnabled && renderToolbar()}
      {!appState.openMenu && appState.showStats && (
        <Stats
          appState={appState}
          setAppState={setAppState}
          elements={elements}
          onClose={() => {
            actionManager.executeAction(actionToggleStats);
          }}
          renderCustomStats={renderCustomStats}
        />
      )}
      <div
        className="App-bottom-bar"
        style={{
          marginBottom: SCROLLBAR_WIDTH + SCROLLBAR_MARGIN * 2,
          marginLeft: SCROLLBAR_WIDTH + SCROLLBAR_MARGIN * 2,
          marginRight: SCROLLBAR_WIDTH + SCROLLBAR_MARGIN * 2,
        }}
      >
        <Island padding={0}>
          {appState.openMenu === "shape" &&
          !appState.viewModeEnabled &&
          showSelectedShapeActions(appState, elements) ? (
            <Section className="App-mobile-menu" heading="selectedShapeActions">
              <SelectedShapeActions
                appState={appState}
                elements={elements}
                renderAction={actionManager.renderAction}
              />
            </Section>
          ) : null}
          <Footer
            appState={appState}
            actionManager={actionManager}
            showExitZenModeBtn={showExitZenModeBtn}
            renderWelcomeScreen={renderWelcomeScreen}
          />
        </Island>
      </div>
    </>
  );
};
