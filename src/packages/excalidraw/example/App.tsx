import { useCallback, useEffect, useRef, useState } from "react";

import ExampleSidebar from "./sidebar/ExampleSidebar";

import type * as TExcalidraw from "../index";

import "./App.scss";
import initialData from "./initialData";
import { nanoid } from "nanoid";
import {
  resolvablePromise,
  ResolvablePromise,
  withBatchedUpdates,
  withBatchedUpdatesThrottled,
} from "../../../utils";
import { EVENT } from "../../../constants";
import { distance2d } from "../../../math";
import { fileOpen } from "../../../data/filesystem";
import { loadSceneOrLibraryFromBlob } from "../../utils";
import {
  AppState,
  BinaryFileData,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  Gesture,
  PointerDownState as ExcalidrawPointerDownState,
} from "../../../types";
import { NonDeletedExcalidrawElement } from "../../../element/types";
import { ImportedLibraryData } from "../../../data/types";
import CustomFooter from "./CustomFooter";
import MobileFooter from "./MobileFooter";

declare global {
  interface Window {
    ExcalidrawLib: typeof TExcalidraw;
  }
}

type Comment = {
  x: number;
  y: number;
  value: string;
  id?: string;
};

type PointerDownState = {
  x: number;
  y: number;
  hitElement: Comment;
  onMove: any;
  onUp: any;
  hitElementOffsets: {
    x: number;
    y: number;
  };
};
// This is so that we use the bundled excalidraw.development.js file instead
// of the actual source code

const {
  exportToCanvas,
  exportToSvg,
  exportToBlob,
  exportToClipboard,
  Excalidraw,
  useHandleLibrary,
  MIME_TYPES,
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
  restoreElements,
  Sidebar,
  Footer,
  WelcomeScreen,
  MainMenu,
  LiveCollaborationTrigger,
} = window.ExcalidrawLib;

const COMMENT_ICON_DIMENSION = 32;
const COMMENT_INPUT_HEIGHT = 50;
const COMMENT_INPUT_WIDTH = 150;

export interface AppProps {
  appTitle: string;
  useCustom: (api: ExcalidrawImperativeAPI | null, customArgs?: any[]) => void;
  customArgs?: any[];
}

export default function App({ appTitle, useCustom, customArgs }: AppProps) {
  const appRef = useRef<any>(null);
  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [canvasUrl, setCanvasUrl] = useState<string>("");
  const [exportWithDarkMode, setExportWithDarkMode] = useState(false);
  const [exportEmbedScene, setExportEmbedScene] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [commentIcons, setCommentIcons] = useState<{ [id: string]: Comment }>(
    {},
  );
  const [comment, setComment] = useState<Comment | null>(null);

  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useCustom(excalidrawAPI, customArgs);

  useHandleLibrary({ excalidrawAPI });

  useEffect(() => {
    if (!excalidrawAPI) {
    }
  }, [excalidrawAPI]);

  const renderTopLeftUI = (isMobile: boolean) => {
    return (
      <>
        {!isMobile && (
          <LiveCollaborationTrigger
            isCollaborating={isCollaborating}
            onSelect={() => {
              window.alert("Collab dialog clicked");
            }}
          />
        )}
        <button
          onClick={() => alert("This is an empty top right UI")}
          style={{ height: "2.5rem" }}
        >
          {" "}
          Click me{" "}
        </button>
      </>
    );
  };

  const loadSceneOrLibrary = async () => {
    const file = await fileOpen({ description: "Excalidraw or library file" });
    const contents = await loadSceneOrLibraryFromBlob(file, null, null);
    if (contents.type === MIME_TYPES.excalidraw) {
      excalidrawAPI?.updateScene(contents.data as any);
    } else if (contents.type === MIME_TYPES.excalidrawlib) {
      excalidrawAPI?.updateLibrary({
        libraryItems: (contents.data as ImportedLibraryData).libraryItems!,
        openLibraryMenu: true,
      });
    }
  };

  const updateScene = async () => {
    const res = await fetch("https://i.imgur.com/oH0rXro.jpeg");
    const imageData = await res.blob();
    const reader = URL.createObjectURL(imageData);
    const image = new Image();
    image.src = reader;

    image.onload = function () {
      const imagesArray: BinaryFileData[] = [
        {
          id: "background" as BinaryFileData["id"],
          dataURL: reader as BinaryFileData["dataURL"],
          mimeType: MIME_TYPES.jpg,
          created: Date.now() * 1000,
          lastRetrieved: Date.now() * 1000,
        },
      ];

      excalidrawAPI!.addFiles(imagesArray);

      const sceneData = {
        elements: restoreElements(
          [
            {
              type: "image",
              version: 185,
              versionNonce: 1761920132,
              isDeleted: false,
              id: "background",
              fillStyle: "hachure",
              strokeWidth: 1,
              strokeStyle: "solid",
              roughness: 1,
              opacity: 100,
              angle: 0,
              x: window.innerWidth / 2 - image.width / 2,
              y: 150,
              strokeColor: "transparent",
              backgroundColor: "transparent",
              width: image.width,
              height: image.height,
              seed: 707269846,
              groupIds: [],
              roundness: {
                type: 2,
              },
              boundElements: [],
              updated: 1677092245612,
              link: null,
              locked: true,
              status: "pending",
              fileId: "background" as BinaryFileData["id"],
              scale: [1, 1],
            },
          ],
          null,
        ),
        appState: {
          viewBackgroundColor: "#edf2ff",
        },
      };
      excalidrawAPI?.updateScene(sceneData);
    };
  };

  const onLinkOpen = useCallback(
    (
      element: NonDeletedExcalidrawElement,
      event: CustomEvent<{
        nativeEvent: MouseEvent | React.PointerEvent<HTMLCanvasElement>;
      }>,
    ) => {
      const link = element.link!;
      const { nativeEvent } = event.detail;
      const isNewTab = nativeEvent.ctrlKey || nativeEvent.metaKey;
      const isNewWindow = nativeEvent.shiftKey;
      const isInternalLink =
        link.startsWith("/") || link.includes(window.location.origin);
      if (isInternalLink && !isNewTab && !isNewWindow) {
        // signal that we're handling the redirect ourselves
        event.preventDefault();
        // do a custom redirect, such as passing to react-router
        // ...
      }
    },
    [],
  );

  const onCopy = async (type: "png" | "svg" | "json") => {
    if (!excalidrawAPI) {
      return false;
    }
    await exportToClipboard({
      elements: excalidrawAPI.getSceneElements(),
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
      type,
    });
    window.alert(`Copied to clipboard as ${type} successfully`);
  };

  const [pointerData, setPointerData] = useState<{
    pointer: { x: number; y: number };
    button: "down" | "up";
    pointersMap: Gesture["pointers"];
  } | null>(null);

  const onPointerDown = (
    activeTool: AppState["activeTool"],
    pointerDownState: ExcalidrawPointerDownState,
  ) => {
    if (activeTool.type === "custom" && activeTool.customType === "comment") {
      const { x, y } = pointerDownState.origin;
      setComment({ x, y, value: "" });
    }
  };

  const rerenderCommentIcons = () => {
    if (!excalidrawAPI) {
      return false;
    }
    const commentIconsElements = appRef.current.querySelectorAll(
      ".comment-icon",
    ) as HTMLElement[];
    commentIconsElements.forEach((ele) => {
      const id = ele.id;
      const appstate = excalidrawAPI.getAppState();
      const { x, y } = sceneCoordsToViewportCoords(
        { sceneX: commentIcons[id].x, sceneY: commentIcons[id].y },
        appstate,
      );
      ele.style.left = `${
        x - COMMENT_ICON_DIMENSION / 2 - appstate!.offsetLeft
      }px`;
      ele.style.top = `${
        y - COMMENT_ICON_DIMENSION / 2 - appstate!.offsetTop
      }px`;
    });
  };

  const onPointerMoveFromPointerDownHandler = (
    pointerDownState: PointerDownState,
  ) => {
    return withBatchedUpdatesThrottled((event) => {
      if (!excalidrawAPI) {
        return false;
      }
      const { x, y } = viewportCoordsToSceneCoords(
        {
          clientX: event.clientX - pointerDownState.hitElementOffsets.x,
          clientY: event.clientY - pointerDownState.hitElementOffsets.y,
        },
        excalidrawAPI.getAppState(),
      );
      setCommentIcons({
        ...commentIcons,
        [pointerDownState.hitElement.id!]: {
          ...commentIcons[pointerDownState.hitElement.id!],
          x,
          y,
        },
      });
    });
  };
  const onPointerUpFromPointerDownHandler = (
    pointerDownState: PointerDownState,
  ) => {
    return withBatchedUpdates((event) => {
      window.removeEventListener(EVENT.POINTER_MOVE, pointerDownState.onMove);
      window.removeEventListener(EVENT.POINTER_UP, pointerDownState.onUp);
      excalidrawAPI?.setActiveTool({ type: "selection" });
      const distance = distance2d(
        pointerDownState.x,
        pointerDownState.y,
        event.clientX,
        event.clientY,
      );
      if (distance === 0) {
        if (!comment) {
          setComment({
            x: pointerDownState.hitElement.x + 60,
            y: pointerDownState.hitElement.y,
            value: pointerDownState.hitElement.value,
            id: pointerDownState.hitElement.id,
          });
        } else {
          setComment(null);
        }
      }
    });
  };

  const renderCommentIcons = () => {
    return Object.values(commentIcons).map((commentIcon) => {
      if (!excalidrawAPI) {
        return false;
      }
      const appState = excalidrawAPI.getAppState();
      const { x, y } = sceneCoordsToViewportCoords(
        { sceneX: commentIcon.x, sceneY: commentIcon.y },
        excalidrawAPI.getAppState(),
      );
      return (
        <div
          id={commentIcon.id}
          key={commentIcon.id}
          style={{
            top: `${y - COMMENT_ICON_DIMENSION / 2 - appState!.offsetTop}px`,
            left: `${x - COMMENT_ICON_DIMENSION / 2 - appState!.offsetLeft}px`,
            position: "absolute",
            zIndex: 1,
            width: `${COMMENT_ICON_DIMENSION}px`,
            height: `${COMMENT_ICON_DIMENSION}px`,
            cursor: "pointer",
            touchAction: "none",
          }}
          className="comment-icon"
          onPointerDown={(event) => {
            event.preventDefault();
            if (comment) {
              commentIcon.value = comment.value;
              saveComment();
            }
            const pointerDownState: any = {
              x: event.clientX,
              y: event.clientY,
              hitElement: commentIcon,
              hitElementOffsets: { x: event.clientX - x, y: event.clientY - y },
            };
            const onPointerMove =
              onPointerMoveFromPointerDownHandler(pointerDownState);
            const onPointerUp =
              onPointerUpFromPointerDownHandler(pointerDownState);
            window.addEventListener(EVENT.POINTER_MOVE, onPointerMove);
            window.addEventListener(EVENT.POINTER_UP, onPointerUp);

            pointerDownState.onMove = onPointerMove;
            pointerDownState.onUp = onPointerUp;

            excalidrawAPI?.setActiveTool({
              type: "custom",
              customType: "comment",
            });
          }}
        >
          <div className="comment-avatar">
            <img src="images/doremon.png" alt="doremon" />
          </div>
        </div>
      );
    });
  };

  const saveComment = () => {
    if (!comment) {
      return;
    }
    if (!comment.id && !comment.value) {
      setComment(null);
      return;
    }
    const id = comment.id || nanoid();
    setCommentIcons({
      ...commentIcons,
      [id]: {
        x: comment.id ? comment.x - 60 : comment.x,
        y: comment.y,
        id,
        value: comment.value,
      },
    });
    setComment(null);
  };

  const renderComment = () => {
    if (!comment) {
      return null;
    }
    const appState = excalidrawAPI?.getAppState()!;
    const { x, y } = sceneCoordsToViewportCoords(
      { sceneX: comment.x, sceneY: comment.y },
      appState,
    );
    let top = y - COMMENT_ICON_DIMENSION / 2 - appState.offsetTop;
    let left = x - COMMENT_ICON_DIMENSION / 2 - appState.offsetLeft;

    if (
      top + COMMENT_INPUT_HEIGHT <
      appState.offsetTop + COMMENT_INPUT_HEIGHT
    ) {
      top = COMMENT_ICON_DIMENSION / 2;
    }
    if (top + COMMENT_INPUT_HEIGHT > appState.height) {
      top = appState.height - COMMENT_INPUT_HEIGHT - COMMENT_ICON_DIMENSION / 2;
    }
    if (
      left + COMMENT_INPUT_WIDTH <
      appState.offsetLeft + COMMENT_INPUT_WIDTH
    ) {
      left = COMMENT_ICON_DIMENSION / 2;
    }
    if (left + COMMENT_INPUT_WIDTH > appState.width) {
      left = appState.width - COMMENT_INPUT_WIDTH - COMMENT_ICON_DIMENSION / 2;
    }

    return (
      <textarea
        className="comment"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          position: "absolute",
          zIndex: 1,
          height: `${COMMENT_INPUT_HEIGHT}px`,
          width: `${COMMENT_INPUT_WIDTH}px`,
        }}
        ref={(ref) => {
          setTimeout(() => ref?.focus());
        }}
        placeholder={comment.value ? "Reply" : "Comment"}
        value={comment.value}
        onChange={(event) => {
          setComment({ ...comment, value: event.target.value });
        }}
        onBlur={saveComment}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === "Enter") {
            event.preventDefault();
            saveComment();
          }
        }}
      />
    );
  };

  const renderSidebar = () => {
    return (
      <Sidebar dockable={false}>
        <Sidebar.Header>Custom header!</Sidebar.Header>
        Custom sidebar!
      </Sidebar>
    );
  };

  const renderBottombar = () => {
    return (
      <Sidebar placement="bottom" dockable={false}>
        <Sidebar.Header>Custom bottom!</Sidebar.Header>
        Custom bottombar!
      </Sidebar>
    );
  };

  const renderMenu = () => {
    return (
      <MainMenu>
        <MainMenu.DefaultItems.SaveAsImage />
        <MainMenu.DefaultItems.Export />
        <MainMenu.Separator />
        <MainMenu.DefaultItems.LiveCollaborationTrigger
          isCollaborating={isCollaborating}
          onSelect={() => window.alert("You clicked on collab button")}
        />
        <MainMenu.Group title="Excalidraw links">
          <MainMenu.DefaultItems.Socials />
        </MainMenu.Group>
        <MainMenu.Separator />
        <MainMenu.ItemCustom>
          <button
            style={{ height: "2rem" }}
            onClick={() => window.alert("custom menu item")}
          >
            custom item
          </button>
        </MainMenu.ItemCustom>
        <MainMenu.DefaultItems.Help />

        {excalidrawAPI && <MobileFooter excalidrawAPI={excalidrawAPI} />}
      </MainMenu>
    );
  };
  return (
    <div className="App" ref={appRef}>
      <h1>{appTitle}</h1>
      <ExampleSidebar>
        <div className="button-wrapper">
          <button onClick={loadSceneOrLibrary}>Load Scene or Library</button>
          <button className="update-scene" onClick={updateScene}>
            Update Scene
          </button>
          <button
            className="reset-scene"
            onClick={() => {
              excalidrawAPI?.resetScene();
            }}
          >
            Reset Scene
          </button>

          <label>
            <input
              type="checkbox"
              checked={viewModeEnabled}
              onChange={() => setViewModeEnabled(!viewModeEnabled)}
            />
            View mode
          </label>
          <label>
            <input
              type="checkbox"
              checked={zenModeEnabled}
              onChange={() => setZenModeEnabled(!zenModeEnabled)}
            />
            Zen mode
          </label>
          <label>
            <input
              type="checkbox"
              checked={gridModeEnabled}
              onChange={() => setGridModeEnabled(!gridModeEnabled)}
            />
            Grid mode
          </label>
          <label>
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={() => {
                let newTheme = "light";
                if (theme === "light") {
                  newTheme = "dark";
                }
                setTheme(newTheme);
              }}
            />
            Switch to Dark Theme
          </label>
          <div>
            <button onClick={onCopy.bind(null, "png")}>
              Copy to Clipboard as PNG
            </button>
            <button onClick={onCopy.bind(null, "svg")}>
              Copy to Clipboard as SVG
            </button>
            <button onClick={onCopy.bind(null, "json")}>
              Copy to Clipboard as JSON
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: "1em",
              justifyContent: "center",
              marginTop: "1em",
            }}
          >
            <div>x: {pointerData?.pointer.x ?? 0}</div>
            <div>y: {pointerData?.pointer.y ?? 0}</div>
          </div>
        </div>
        <div className="excalidraw-wrapper">
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "20px",
              display: "flex",
              zIndex: 9999999999999999,
              padding: "5px 10px",
              transform: "translateX(-50%)",
              background: "rgba(255, 255, 255, 0.8)",
              gap: "1rem",
            }}
          >
            <button onClick={() => excalidrawAPI?.toggleMenu("customSidebar")}>
              Toggle Custom Sidebar
            </button>
          </div>
          <Excalidraw
            ref={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
            onChange={(elements, state) => {
              console.info("Elements :", elements, "State : ", state);
            }}
            onPointerUpdate={(payload: {
              pointer: { x: number; y: number };
              button: "down" | "up";
              pointersMap: Gesture["pointers"];
            }) => setPointerData(payload)}
            viewModeEnabled={viewModeEnabled}
            zenModeEnabled={zenModeEnabled}
            gridModeEnabled={gridModeEnabled}
            theme={theme}
            name="Custom name of drawing"
            UIOptions={{ canvasActions: { loadScene: false } }}
            onLinkOpen={onLinkOpen}
            onPointerDown={onPointerDown}
            onScrollChange={rerenderCommentIcons}
            renderSidebar={renderSidebar}
            renderBottombar={renderBottombar}
            renderTopLeftUI={renderTopLeftUI}
            renderCustomDialog={{
              title: "test",
              content: () => <div>test</div>,
            }}
            initialData={{
              appState: {
                openDialog: "custom",
              },
            }}
          >
            {excalidrawAPI && (
              <Footer>
                <CustomFooter excalidrawAPI={excalidrawAPI} />
              </Footer>
            )}
            <WelcomeScreen />
            {/*{renderMenu()}*/}
          </Excalidraw>
          {Object.keys(commentIcons || []).length > 0 && renderCommentIcons()}
          {comment && renderComment()}
        </div>

        <div className="export-wrapper button-wrapper">
          <label className="export-wrapper__checkbox">
            <input
              type="checkbox"
              checked={exportWithDarkMode}
              onChange={() => setExportWithDarkMode(!exportWithDarkMode)}
            />
            Export with dark mode
          </label>
          <label className="export-wrapper__checkbox">
            <input
              type="checkbox"
              checked={exportEmbedScene}
              onChange={() => setExportEmbedScene(!exportEmbedScene)}
            />
            Export with embed scene
          </label>
          <button
            onClick={async () => {
              if (!excalidrawAPI) {
                return;
              }
              const svg = await exportToSvg({
                elements: excalidrawAPI?.getSceneElements(),
                appState: {
                  ...initialData.appState,
                  exportWithDarkMode,
                  exportEmbedScene,
                  width: 300,
                  height: 100,
                },
                files: excalidrawAPI?.getFiles(),
              });
              appRef.current.querySelector(".export-svg").innerHTML =
                svg.outerHTML;
            }}
          >
            Export to SVG
          </button>
          <div className="export export-svg"></div>

          <button
            onClick={async () => {
              if (!excalidrawAPI) {
                return;
              }
              const blob = await exportToBlob({
                elements: excalidrawAPI?.getSceneElements(),
                mimeType: "image/png",
                appState: {
                  ...initialData.appState,
                  exportEmbedScene,
                  exportWithDarkMode,
                },
                files: excalidrawAPI?.getFiles(),
              });
              setBlobUrl(window.URL.createObjectURL(blob));
            }}
          >
            Export to Blob
          </button>
          <div className="export export-blob">
            <img src={blobUrl} alt="" />
          </div>

          <button
            onClick={async () => {
              if (!excalidrawAPI) {
                return;
              }
              const canvas = await exportToCanvas({
                elements: excalidrawAPI.getSceneElements(),
                appState: {
                  ...initialData.appState,
                  exportWithDarkMode,
                },
                files: excalidrawAPI.getFiles(),
              });
              const ctx = canvas.getContext("2d")!;
              ctx.font = "30px Virgil";
              ctx.strokeText("My custom text", 50, 60);
              setCanvasUrl(canvas.toDataURL());
            }}
          >
            Export to Canvas
          </button>
          <div className="export export-canvas">
            <img src={canvasUrl} alt="" />
          </div>
        </div>
      </ExampleSidebar>
    </div>
  );
}
