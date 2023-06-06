import { useElementSize } from "@hooks/useElementWidth";
import dispatch from "@lib/event.js";

const DispatchElementSize = () => {
  const size = useElementSize(".proca-widget");
  dispatch("size", size);
  return null;
};

export default DispatchElementSize;
