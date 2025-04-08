import { ExcalidrawElement, NonDeletedExcalidrawElement, NonDeleted } from "./types";
export { newElement, newTextElement, updateTextElement, refreshTextDimensions, newLinearElement, newImageElement, duplicateElement, } from "./newElement";
export { getElementAbsoluteCoords, getElementBounds, getCommonBounds, getDiamondPoints, getArrowheadPoints, getClosestElementBounds, } from "./bounds";
export { OMIT_SIDES_FOR_MULTIPLE_ELEMENTS, getTransformHandlesFromCoords, getTransformHandles, } from "./transformHandles";
export { hitTest, isHittingElementBoundingBoxWithoutHittingElement, } from "./collision";
export { resizeTest, getCursorForResizingElement, getElementWithTransformHandleType, getTransformHandleTypeFromCoords, } from "./resizeTest";
export { transformElements, getResizeOffsetXY, getResizeArrowDirection, } from "./resizeElements";
export { dragSelectedElements, getDragOffsetXY, dragNewElement, } from "./dragElements";
export { isTextElement, isExcalidrawElement } from "./typeChecks";
export { textWysiwyg } from "./textWysiwyg";
export { redrawTextBoundingBox } from "./textElement";
export { getPerfectElementSize, getLockedLinearCursorAlignSize, isInvisiblySmallElement, resizePerfectLineForNWHandler, getNormalizedDimensions, } from "./sizeHelpers";
export { showSelectedShapeActions } from "./showSelectedShapeActions";
export declare const getSceneVersion: (elements: readonly ExcalidrawElement[]) => number;
export declare const getVisibleElements: (elements: readonly ExcalidrawElement[]) => readonly NonDeletedExcalidrawElement[];
export declare const getNonDeletedElements: (elements: readonly ExcalidrawElement[]) => readonly NonDeletedExcalidrawElement[];
export declare const isNonDeletedElement: <T extends ExcalidrawElement>(element: T) => element is NonDeleted<T>;
export declare const clearElementsForDatabase: (elements: readonly ExcalidrawElement[]) => ExcalidrawElement[];
export declare const clearElementsForExport: (elements: readonly ExcalidrawElement[]) => ExcalidrawElement[];
export declare const clearElementsForLocalStorage: (elements: readonly ExcalidrawElement[]) => ExcalidrawElement[];
