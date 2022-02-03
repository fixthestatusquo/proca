const scrollWidgetIntoView = () = {
  widget = document.getElmentById("proca-widget");
  if (!widget) return;
  widget.scrollIntoView();
}

export {scrollWidgetIntoView};
