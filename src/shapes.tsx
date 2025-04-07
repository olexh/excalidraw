import {
  ArrowIcon,
  DiamondIcon,
  EllipseIcon,
  EraserIcon,
  FreedrawIcon,
  ImageIcon,
  LineIcon,
  RectangleIcon,
  SelectionIcon,
  TextIcon,
} from "./components/icons";
import { KEYS } from "./keys";

export const ACCESSABLE = ["selection", "freedraw", "text", "image", "eraser"];

export const SHAPES = [
  {
    icon: SelectionIcon,
    value: "selection",
    key: KEYS.V,
    numericKey: KEYS["1"],
    fillable: true,
  },
  {
    icon: RectangleIcon,
    value: "rectangle",
    key: KEYS.R,
    numericKey: KEYS["6"],
    fillable: true,
  },
  {
    icon: EllipseIcon,
    value: "ellipse",
    key: KEYS.O,
    numericKey: KEYS["7"],
    fillable: true,
  },
  {
    icon: ArrowIcon,
    value: "arrow",
    key: KEYS.A,
    numericKey: KEYS["8"],
    fillable: true,
  },
  {
    icon: LineIcon,
    value: "line",
    key: KEYS.L,
    numericKey: KEYS["9"],
    fillable: true,
  },
  {
    icon: FreedrawIcon,
    value: "freedraw",
    key: [KEYS.P, KEYS.X],
    numericKey: KEYS["2"],
    fillable: false,
  },
  {
    icon: EraserIcon,
    value: "eraser",
    key: KEYS.E,
    numericKey: KEYS["3"],
    fillable: false,
  },
  {
    icon: TextIcon,
    value: "text",
    key: KEYS.T,
    numericKey: KEYS["4"],
    fillable: false,
  },
  {
    icon: ImageIcon,
    value: "image",
    key: null,
    numericKey: KEYS["5"],
    fillable: false,
  },
] as const;

export const findShapeByKey = (key: string) => {
  const shape = SHAPES.find((shape, index) => {
    return (
      (shape.numericKey != null && key === shape.numericKey.toString()) ||
      (shape.key &&
        (typeof shape.key === "string"
          ? shape.key === key
          : (shape.key as readonly string[]).includes(key)))
    );
  });
  return shape?.value || null;
};
