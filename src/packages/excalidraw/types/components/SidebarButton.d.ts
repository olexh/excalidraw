import "./ToolIcon.scss";
declare type LockIconProps = {
    title?: string;
    name?: string;
    onChange?(): void;
    isMobile?: boolean;
};
export declare const SidebarButton: (props: LockIconProps) => JSX.Element;
export {};
