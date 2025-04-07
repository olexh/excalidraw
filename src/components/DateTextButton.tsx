import "./ToolIcon.scss";

import clsx from "clsx";
import {ToolButton} from "./ToolButton";
import {datetextIcon} from "./icons";
import {KEYS} from "../keys";

type LockIconProps = {
  title?: string;
  name?: string;
  onChange?(): void;
  isMobile?: boolean;
};

export const DateTextButton = (props: LockIconProps) => {
  return (
    <ToolButton
      className={clsx("Shape", {fillable: false})}
      type="radio"
      icon={datetextIcon}
      name="editor-current-shape"
      checked={false}
      title={`${props.title} — 0`}
      keyBindingLabel={undefined}
      aria-label={`${props.title} — 0`}
      aria-keyshortcuts={KEYS["0"]}
      data-testid={`toolbar-hand`}
      onChange={() => props.onChange?.()}
    />
  );
};
