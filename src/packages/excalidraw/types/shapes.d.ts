export declare const ACCESSABLE: string[];
export declare const SHAPES: readonly [{
    readonly icon: JSX.Element;
    readonly value: "selection";
    readonly key: "v";
    readonly numericKey: "1";
    readonly fillable: true;
}, {
    readonly icon: JSX.Element;
    readonly value: "rectangle";
    readonly key: "r";
    readonly numericKey: "6";
    readonly fillable: true;
}, {
    readonly icon: JSX.Element;
    readonly value: "ellipse";
    readonly key: "o";
    readonly numericKey: "7";
    readonly fillable: true;
}, {
    readonly icon: JSX.Element;
    readonly value: "arrow";
    readonly key: "a";
    readonly numericKey: "8";
    readonly fillable: true;
}, {
    readonly icon: JSX.Element;
    readonly value: "line";
    readonly key: "l";
    readonly numericKey: "9";
    readonly fillable: true;
}, {
    readonly icon: JSX.Element;
    readonly value: "freedraw";
    readonly key: readonly ["p", "x"];
    readonly numericKey: "2";
    readonly fillable: false;
}, {
    readonly icon: JSX.Element;
    readonly value: "eraser";
    readonly key: "e";
    readonly numericKey: "3";
    readonly fillable: false;
}, {
    readonly icon: JSX.Element;
    readonly value: "text";
    readonly key: "t";
    readonly numericKey: "4";
    readonly fillable: false;
}, {
    readonly icon: JSX.Element;
    readonly value: "image";
    readonly key: null;
    readonly numericKey: "5";
    readonly fillable: false;
}];
export declare const findShapeByKey: (key: string) => "line" | "arrow" | "text" | "selection" | "rectangle" | "ellipse" | "image" | "freedraw" | "eraser" | null;
