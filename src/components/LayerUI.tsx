import clsx from "clsx";
import React from "react";
import { ActionManager } from "../actions/manager";
import {
  CLASSES,
  DEFAULT_VERTICAL_ALIGN,
  LIBRARY_SIDEBAR_WIDTH,
} from "../constants";
import { exportCanvas } from "../data";
import {
  isTextElement,
  newTextElement,
  showSelectedShapeActions,
} from "../element";
import { NonDeletedExcalidrawElement } from "../element/types";
import { Language, t } from "../i18n";
import { calculateScrollCenter } from "../scene";
import { ExportType } from "../scene/types";
import { AppProps, AppState, BinaryFiles, ExcalidrawProps } from "../types";
import { isShallowEqual, muteFSAbortError } from "../utils";
import { SelectedShapeActions, ShapesSwitcher } from "./Actions";
import { ErrorDialog } from "./ErrorDialog";
import { ExportCB, ImageExportDialog } from "./ImageExportDialog";
import { FixedSideContainer } from "./FixedSideContainer";
import { Island } from "./Island";
import { LoadingMessage } from "./LoadingMessage";
import { MobileMenu } from "./MobileMenu";
import { PasteChartDialog } from "./PasteChartDialog";
import { Section } from "./Section";
import Stack from "./Stack";
import Library from "../data/library";
import { JSONExportDialog } from "./JSONExportDialog";
import { isImageFileHandle } from "../data/blob";
import { LibraryMenu } from "./LibraryMenu";

import "./LayerUI.scss";
import "./Toolbar.scss";
import { trackEvent } from "../analytics";
import { useDevice } from "../components/App";
import { Stats } from "./Stats";
import { actionToggleStats } from "../actions/actionToggleStats";
import Footer from "./footer/Footer";
import { hostSidebarCountersAtom } from "./Sidebar/Sidebar";
import { jotaiScope } from "../jotai";
import { Provider, useAtom } from "jotai";
import MainMenu from "./main-menu/MainMenu";
import { ActiveConfirmDialog } from "./ActiveConfirmDialog";
import { SidebarButton } from "./SidebarButton";
import { TunnelsContext, useInitializeTunnels } from "./context/tunnels";
import { DateTextButton } from "./DateTextButton";
import { CustomDialog } from "./CustomContentDialog";
import { HandButton } from "./HandButton";
import { isHandToolActive } from "../appState";

interface LayerUIProps {
  actionManager: ActionManager;
  appState: AppState;
  files: BinaryFiles;
  canvas: HTMLCanvasElement | null;
  setAppState: React.Component<any, AppState>["setState"];
  elements: readonly NonDeletedExcalidrawElement[];
  onLockToggle: () => void;
  onHandToolToggle: () => void;
  onPenModeToggle: () => void;
  onInsertElements: (elements: readonly NonDeletedExcalidrawElement[]) => void;
  showExitZenModeBtn: boolean;
  langCode: Language["code"];
  renderLibrary?: ExcalidrawProps["renderLibrary"];
  renderTopLeftUI?: ExcalidrawProps["renderTopLeftUI"];
  renderCustomStats?: ExcalidrawProps["renderCustomStats"];
  renderCustomSidebar?: ExcalidrawProps["renderSidebar"];
  renderCustomBottombar?: ExcalidrawProps["renderBottombar"];
  renderCustomDialog?: ExcalidrawProps["renderCustomDialog"];
  libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
  toggleMenu: (
    type: "library" | "customSidebar" | "customBottombar",
    force?: boolean,
  ) => boolean;
  UIOptions: AppProps["UIOptions"];
  focusContainer: () => void;
  library: Library;
  id: string;
  onImageAction: (data: { insertOnCanvasDirectly: boolean }) => void;
  renderWelcomeScreen: boolean;
  children?: React.ReactNode;
}

const DefaultMainMenu: React.FC<{
  UIOptions: AppProps["UIOptions"];
}> = ({ UIOptions }) => {
  return (
    <MainMenu __fallback>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.SaveToActiveFile />
      {/* FIXME we should to test for this inside the item itself */}
      {UIOptions.canvasActions.export && <MainMenu.DefaultItems.Export />}
      {/* FIXME we should to test for this inside the item itself */}
      {UIOptions.canvasActions.saveAsImage && (
        <MainMenu.DefaultItems.SaveAsImage />
      )}
      <MainMenu.DefaultItems.Help />
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.Group title="Excalidraw links">
        <MainMenu.DefaultItems.Socials />
      </MainMenu.Group>
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
};

const LayerUI = ({
  actionManager,
  appState,
  files,
  setAppState,
  elements,
  canvas,
  onLockToggle,
  onHandToolToggle,
  onPenModeToggle,
  onInsertElements,
  showExitZenModeBtn,
  renderTopLeftUI,
  renderLibrary,
  renderCustomStats,
  renderCustomSidebar,
  renderCustomBottombar,
  renderCustomDialog,
  libraryReturnUrl,
  UIOptions,
  focusContainer,
  library,
  id,
  onImageAction,
  renderWelcomeScreen,
  toggleMenu,
  children,
}: LayerUIProps) => {
  const device = useDevice();
  const tunnels = useInitializeTunnels();

  const _renderCustomDialog = () => {
    console.log({ renderCustomDialog });
    if (!renderCustomDialog) {
      return null;
    }

    return (
      <CustomDialog
        title={renderCustomDialog.title}
        appState={appState}
        setAppState={setAppState}
      >
        {renderCustomDialog.content()}
      </CustomDialog>
    );
  };

  const renderJSONExportDialog = () => {
    if (!UIOptions.canvasActions.export) {
      return null;
    }

    return (
      <JSONExportDialog
        elements={elements}
        appState={appState}
        files={files}
        actionManager={actionManager}
        exportOpts={UIOptions.canvasActions.export}
        canvas={canvas}
        setAppState={setAppState}
      />
    );
  };

  const renderImageExportDialog = () => {
    if (!UIOptions.canvasActions.saveAsImage) {
      return null;
    }

    const createExporter =
      (type: ExportType): ExportCB =>
      async (exportedElements) => {
        trackEvent("export", type, "ui");
        const fileHandle = await exportCanvas(
          type,
          exportedElements,
          appState,
          files,
          {
            exportBackground: appState.exportBackground,
            name: appState.name,
            viewBackgroundColor: appState.viewBackgroundColor,
          },
        )
          .catch(muteFSAbortError)
          .catch((error) => {
            console.error(error);
            setAppState({ errorMessage: error.message });
          });

        if (
          appState.exportEmbedScene &&
          fileHandle &&
          isImageFileHandle(fileHandle)
        ) {
          setAppState({ fileHandle });
        }
      };

    return (
      <ImageExportDialog
        elements={elements}
        appState={appState}
        setAppState={setAppState}
        files={files}
        actionManager={actionManager}
        onExportToPng={createExporter("png")}
        onExportToSvg={createExporter("svg")}
        onExportToClipboard={createExporter("clipboard")}
      />
    );
  };

  const renderCanvasActions = () => (
    <div style={{ position: "relative" }}>
      {/* wrapping to Fragment stops React from occasionally complaining
                about identical Keys */}
      <tunnels.mainMenuTunnel.Out />
      {renderWelcomeScreen && <tunnels.welcomeScreenMenuHintTunnel.Out />}
    </div>
  );

  const renderSelectedShapeActions = () => (
    <Section
      heading="selectedShapeActions"
      className={clsx("selected-shape-actions zen-mode-transition", {
        "transition-left": appState.zenModeEnabled,
      })}
    >
      <Island
        className={CLASSES.SHAPE_ACTIONS_MENU}
        padding={2}
        style={{
          // we want to make sure this doesn't overflow so subtracting the
          // approximate height of hamburgerMenu + footer
          maxHeight: `${appState.height - 166}px`,
        }}
      >
        <SelectedShapeActions
          appState={appState}
          elements={elements}
          renderAction={actionManager.renderAction}
        />
      </Island>
    </Section>
  );

  const renderFixedSideContainer = () => {
    const shouldRenderSelectedShapeActions = showSelectedShapeActions(
      appState,
      elements,
    );

    return (
      <FixedSideContainer side="top">
        <div className="App-menu App-menu_top">
          <div className="top-left-stack">
            {renderTopLeftUI?.(device.isMobile, appState)}
          </div>
          {!appState.viewModeEnabled && (
            <Section heading="shapes" className="shapes-section">
              {(heading: React.ReactNode) => (
                <div style={{ position: "relative" }}>
                  {renderWelcomeScreen && (
                    <tunnels.welcomeScreenToolbarHintTunnel.Out />
                  )}
                  <Stack.Col gap={4} align="start">
                    <Stack.Row
                      gap={1}
                      className={clsx("App-toolbar-container", {
                        "zen-mode": appState.zenModeEnabled,
                      })}
                    >
                      <Island
                        padding={1}
                        className={clsx("App-toolbar", {
                          "zen-mode": appState.zenModeEnabled,
                        })}
                      >
                        {/*<HintViewer
                          appState={appState}
                          elements={elements}
                          isMobile={device.isMobile}
                          device={device}
                        />*/}
                        {heading}
                        <Stack.Row gap={1}>
                          <HandButton
                            checked={isHandToolActive(appState)}
                            onChange={() => onHandToolToggle()}
                            title={t("toolBar.hand")}
                            isMobile
                          />
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
                                  backgroundColor:
                                    appState.currentItemBackgroundColor,
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
                          {renderCustomDialog && (
                            <SidebarButton
                              onChange={() =>
                                setAppState({ openDialog: "custom" })
                              }
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
                    </Stack.Row>
                  </Stack.Col>
                </div>
              )}
            </Section>
          )}
        </div>
        {appState.openMenu === "shape" && renderSelectedShapeActions()}
      </FixedSideContainer>
    );
  };

  const renderSidebars = () => {
    return appState.openSidebar === "customSidebar" ? (
      renderCustomSidebar?.() || null
    ) : appState.openSidebar === "customBottombar" ? (
      renderCustomBottombar?.() || null
    ) : appState.openSidebar === "library" && renderLibrary ? (
      <LibraryMenu
        appState={appState}
        onInsertElements={onInsertElements}
        libraryReturnUrl={libraryReturnUrl}
        focusContainer={focusContainer}
        library={library}
        id={id}
      />
    ) : null;
  };

  const [hostSidebarCounters] = useAtom(hostSidebarCountersAtom, jotaiScope);

  const layerUIJSX = (
    <>
      {/* ------------------------- tunneled UI ---------------------------- */}
      {/* make sure we render host app components first so that we can detect
          them first on initial render to optimize layout shift */}
      {children}
      {/* render component fallbacks. Can be rendered anywhere as they'll be
          tunneled away. We only render tunneled components that actually
          have defaults when host do not render anything. */}
      {/*<DefaultMainMenu UIOptions={UIOptions} />*/}
      {/* ------------------------------------------------------------------ */}

      {appState.isLoading && <LoadingMessage delay={250} />}
      {appState.errorMessage && (
        <ErrorDialog
          message={appState.errorMessage}
          onClose={() => setAppState({ errorMessage: null })}
        />
      )}
      <ActiveConfirmDialog />
      {renderImageExportDialog()}
      {renderJSONExportDialog()}
      {_renderCustomDialog()}
      {appState.pasteDialog.shown && (
        <PasteChartDialog
          setAppState={setAppState}
          appState={appState}
          onInsertChart={onInsertElements}
          onClose={() =>
            setAppState({
              pasteDialog: { shown: false, data: null },
            })
          }
        />
      )}
      {device.isMobile && (
        <MobileMenu
          appState={appState}
          elements={elements}
          actionManager={actionManager}
          renderJSONExportDialog={renderJSONExportDialog}
          renderCustomDialog={_renderCustomDialog}
          renderImageExportDialog={renderImageExportDialog}
          renderSelectedShapeActions={renderSelectedShapeActions}
          onInsertElements={onInsertElements}
          setAppState={setAppState}
          onLockToggle={onLockToggle}
          onHandToolToggle={onHandToolToggle}
          onPenModeToggle={onPenModeToggle}
          canvas={canvas}
          onImageAction={onImageAction}
          renderTopLeftUI={renderTopLeftUI}
          renderLibrary={renderLibrary}
          renderCustomStats={renderCustomStats}
          renderSidebars={renderSidebars}
          device={device}
          renderCustomSidebar={renderCustomSidebar}
          toggleMenu={toggleMenu}
          showExitZenModeBtn={showExitZenModeBtn}
          renderWelcomeScreen={renderWelcomeScreen}
        />
      )}

      {!device.isMobile && (
        <>
          <div
            className={clsx("layer-ui__wrapper", {
              "disable-pointerEvents":
                appState.draggingElement ||
                appState.resizingElement ||
                (appState.editingElement &&
                  !isTextElement(appState.editingElement)),
            })}
            style={
              ((appState.openSidebar === "library" &&
                appState.isSidebarDocked) ||
                hostSidebarCounters.docked) &&
              device.canDeviceFitSidebar
                ? { width: `calc(100% - ${LIBRARY_SIDEBAR_WIDTH}px)` }
                : {}
            }
          >
            {renderWelcomeScreen && <tunnels.welcomeScreenCenterTunnel.Out />}
            {renderFixedSideContainer()}
            <Footer
              appState={appState}
              actionManager={actionManager}
              showExitZenModeBtn={showExitZenModeBtn}
              renderWelcomeScreen={renderWelcomeScreen}
            />
            {appState.showStats && (
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
            {appState.scrolledOutside && (
              <button
                className="scroll-back-to-content"
                onClick={() => {
                  setAppState({
                    ...calculateScrollCenter(elements, appState, canvas),
                  });
                }}
              >
                {t("buttons.scrollBackToContent")}
              </button>
            )}
          </div>
          {renderSidebars()}
        </>
      )}
    </>
  );

  return (
    <Provider scope={tunnels.jotaiScope}>
      <TunnelsContext.Provider value={tunnels}>
        {layerUIJSX}
      </TunnelsContext.Provider>
    </Provider>
  );
};

const stripIrrelevantAppStateProps = (
  appState: AppState,
): Partial<AppState> => {
  const { suggestedBindings, startBoundElement, cursorButton, ...ret } =
    appState;
  return ret;
};

const areEqual = (prevProps: LayerUIProps, nextProps: LayerUIProps) => {
  // short-circuit early
  if (prevProps.children !== nextProps.children) {
    return false;
  }

  const {
    canvas: _prevCanvas,
    // not stable, but shouldn't matter in our case
    onInsertElements: _prevOnInsertElements,
    appState: prevAppState,
    ...prev
  } = prevProps;
  const {
    canvas: _nextCanvas,
    onInsertElements: _nextOnInsertElements,
    appState: nextAppState,
    ...next
  } = nextProps;

  return (
    isShallowEqual(
      stripIrrelevantAppStateProps(prevAppState),
      stripIrrelevantAppStateProps(nextAppState),
    ) && isShallowEqual(prev, next)
  );
};

export default React.memo(LayerUI, areEqual);
