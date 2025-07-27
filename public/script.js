const MIN_HEIGHT = 200;
const MIN_WIDTH = 200;
const draggableContainer = document.getElementById("draggable-container");

const style = draggableContainer.style;

var isDragging = false;

const controller = new AbortController();
const { signal } = controller;

/**@type {'tl' | 'tr' | 'bl' | 'br' | 'pan' | null}*/
var selectedCorner = null;

const css = (value) => `${value}px`;

const isHeightAndWidthInvalid = (h, w) => h < MIN_HEIGHT || w < MIN_WIDTH;

/** @param {MouseEvent} e */
const handleMouseMove = (e) => {
  if (!isDragging && !selectedCorner) {
    return;
  }
  switch (selectedCorner) {
    case "pan":
      handlePan(e);
      break;
    case "tr":
      handleResizeFromTopRight(e);
      break;
    case "tl":
      handleResizeFromTopLeft(e);
      break;
    case "bl":
      handleResizeFromBottomLeft(e);
      break;
    case "br":
      handleResizeFromBottomRight(e);
      break;
    default:
      break;
  }
};

/** @param {HTMLElement} container */
function getContainer(c) {
  return {
    height: c.getBoundingClientRect().height,
    width: c.getBoundingClientRect().width,
    top: c.getBoundingClientRect().top,
    left: c.getBoundingClientRect().left,
    bottom: c.getBoundingClientRect().bottom,
    right: c.getBoundingClientRect().right,
  };
}

/** @param {MouseEvent} e */
const handleMouseDown = (e) => {
  const { target } = e;
  const id = target.id;
  switch (id) {
    case "tl":
    case "tr":
    case "bl":
    case "br":
    case "pan":
      target.classList.add("dragging");
      selectedCorner = id;
      isDragging = true;
      break;
    default:
      selectedCorner = null;
  }
};

/** @param {MouseEvent} e */
const handleMouseUp = (e) => {
  if (selectedCorner) {
    const cornerEl = draggableContainer.querySelector(`#${selectedCorner}`);
    selectedCorner = null;
    cornerEl.classList.remove("dragging");
  }
  isDragging = false;
};

/**@param {MouseEvent} e*/
const handlePan = (e) => {
  const { movementX, movementY } = e;

  const container = getContainer(draggableContainer);

  console.log(container.left, container.right);

  const newLeft = container.left + movementX;
  const newTop = container.top + movementY;
  style.left = css(newLeft);
  style.top = css(newTop);
};

/**@param {MouseEvent} e*/
const handleResizeFromTopLeft = (e) => {
  const { movementX, movementY } = e;

  const container = getContainer(draggableContainer);

  const newHeight = container.height - movementY;
  const newWidth = container.width - movementX;
  if (isHeightAndWidthInvalid(newHeight, newWidth)) {
    return;
  }
  style.height = css(newHeight);
  style.width = css(newWidth);

  const newTop = container.top + movementY;
  const newLeft = container.left + movementX;
  style.top = css(newTop);
  style.left = css(newLeft);
};

/**@param {MouseEvent} e*/
const handleResizeFromTopRight = (e) => {
  const { movementX, movementY } = e;

  console.log(movementX, movementY);

  const container = getContainer(draggableContainer);

  const newWidth = container.width + movementX;
  const newHeight = container.height - movementY;
  if (isHeightAndWidthInvalid(newHeight, newWidth)) {
    return;
  }
  style.width = css(newWidth);
  style.height = css(newHeight);

  const newTop = container.top - movementY;
  const newRight = container.right - movementX;
  style.top = css(newTop);
  style.right = css(newRight);
};
/**@param {MouseEvent} e*/
const handleResizeFromBottomLeft = (e) => {
  const { movementX, movementY } = e;

  const container = getContainer(draggableContainer);

  const newHeight = container.height + movementY;
  const newWidth = container.width - movementX;
  if (isHeightAndWidthInvalid(newHeight, newWidth)) {
    return;
  }
  style.height = css(newHeight);
  style.width = css(newWidth);

  const newLeft = container.left + movementX;
  const newBottom = container.bottom + movementY;
  style.left = css(newLeft);
  style.bottom = css(newBottom);
};
/**@param {MouseEvent} e*/
const handleResizeFromBottomRight = (e) => {
  const { movementX, movementY } = e;

  const container = getContainer(draggableContainer);

  const newHeight = container.height + movementY;
  const newWidth = container.width + movementX;
  if (isHeightAndWidthInvalid(newHeight, newWidth)) {
    return;
  }
  style.height = css(newHeight);
  style.width = css(newWidth);

  const newBottom = container.bottom + movementY;
  const newRight = container.right + movementX;
  style.bottom = css(newBottom);
  style.right = css(newRight);
};

draggableContainer.addEventListener("mousedown", handleMouseDown, { signal });
document.addEventListener("mouseup", handleMouseUp, { signal });
document.addEventListener("mousemove", handleMouseMove, { signal });

window.addEventListener("beforeunload", () => controller.abort());
