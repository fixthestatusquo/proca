import {initConfigState} from '../hooks/useConfig';
import {initDataState} from '../hooks/useData';

export default function init (config,data) {
  initConfigState(config);
  initDataState(data);
};
