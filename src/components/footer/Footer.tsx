import clsx from "clsx";
import {ActionManager} from "../../actions/manager";
import {AppState} from "../../types";
import {ExitZenModeAction, FinalizeAction, UndoRedoActions, ZoomActions,} from "../Actions";
import {useDevice} from "../App";
import {useTunnels} from "../context/tunnels";
import {Section} from "../Section";
import Stack from "../Stack";

const Footer = ({
                  appState,
                  actionManager,
                  showExitZenModeBtn,
                  renderWelcomeScreen,
                }: {
  appState: AppState;
  actionManager: ActionManager;
  showExitZenModeBtn: boolean;
  renderWelcomeScreen: boolean;
}) => {
  const {footerCenterTunnel, welcomeScreenHelpHintTunnel} = useTunnels();

  const device = useDevice();
  const showFinalize =
    !appState.viewModeEnabled && appState.multiElement && device.isTouchScreen;

  return (
    <footer
      role="contentinfo"
      className="layer-ui__wrapper__footer App-menu App-menu_bottom"
    >
      {/*<div
        className={clsx("layer-ui__wrapper__footer-left zen-mode-transition", {
          "layer-ui__wrapper__footer-left--transition-left":
          appState.zenModeEnabled,
        })}
      >
        <Stack.Col gap={2}>
          <Section heading="canvasActions">
            <ZoomActions
              renderAction={actionManager.renderAction}
              zoom={appState.zoom}
            />

            {!appState.viewModeEnabled && (
              <UndoRedoActions
                renderAction={actionManager.renderAction}
                className={clsx("zen-mode-transition", {
                  "layer-ui__wrapper__footer-left--transition-bottom":
                  appState.zenModeEnabled,
                })}
              />
            )}
            {showFinalize && (
              <FinalizeAction
                renderAction={actionManager.renderAction}
                className={clsx("zen-mode-transition", {
                  "layer-ui__wrapper__footer-left--transition-left":
                  appState.zenModeEnabled,
                })}
              />
            )}
          </Section>
        </Stack.Col>
      </div>*/}
      <footerCenterTunnel.Out/>
      <div
        className={clsx("layer-ui__wrapper__footer-right zen-mode-transition", {
          "transition-right disable-pointerEvents": appState.zenModeEnabled,
        })}
      >
        <div style={{position: "relative"}}>
          {renderWelcomeScreen && <welcomeScreenHelpHintTunnel.Out/>}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
Footer.displayName = "Footer";
