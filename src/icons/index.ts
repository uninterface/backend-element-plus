import { Top as ArrowUp } from '@element-plus/icons-vue'
import { Bottom as ArrowDown } from '@element-plus/icons-vue'
import { Back as ArrowLeft } from '@element-plus/icons-vue'
import { Right as ArrowRight } from '@element-plus/icons-vue'
import MoreVertical from './more-vertical.vue'
import type { UiIconCatalogue } from '@uninterface/uninterface/icons'
import { Plus as Icon0 } from '@element-plus/icons-vue'
import { Edit as Icon1 } from '@element-plus/icons-vue'
import { Delete as Icon2 } from '@element-plus/icons-vue'
import { DocumentChecked as Icon3 } from '@element-plus/icons-vue'
import { Close as Icon4 } from '@element-plus/icons-vue'
import { Check as Icon5 } from '@element-plus/icons-vue'
import { Search as Icon6 } from '@element-plus/icons-vue'
import { Refresh as Icon7 } from '@element-plus/icons-vue'
import { CopyDocument as Icon8 } from '@element-plus/icons-vue'
import { Upload as Icon9 } from '@element-plus/icons-vue'
import { Download as Icon10 } from '@element-plus/icons-vue'
import { Close as Icon11 } from '@element-plus/icons-vue'
import { Menu as Icon12 } from '@element-plus/icons-vue'
import { MoreFilled as Icon13 } from '@element-plus/icons-vue'
import { ArrowLeft as Icon14 } from '@element-plus/icons-vue'
import { ArrowRight as Icon15 } from '@element-plus/icons-vue'
import { ArrowDown as Icon16 } from '@element-plus/icons-vue'
import { ArrowUp as Icon17 } from '@element-plus/icons-vue'
import { InfoFilled as Icon18 } from '@element-plus/icons-vue'
import { SuccessFilled as Icon19 } from '@element-plus/icons-vue'
import { WarningFilled as Icon20 } from '@element-plus/icons-vue'
import { CircleCloseFilled as Icon21 } from '@element-plus/icons-vue'
import { View as Icon22 } from '@element-plus/icons-vue'
import { Hide as Icon23 } from '@element-plus/icons-vue'
import { Minus as CommonRemove } from '@element-plus/icons-vue'
import { RefreshLeft as CommonReset } from '@element-plus/icons-vue'
import { CircleClose as CommonClear } from '@element-plus/icons-vue'
import { RefreshRight as CommonRetry } from '@element-plus/icons-vue'
import { House as CommonHome } from '@element-plus/icons-vue'
import { QuestionFilled as CommonHelp } from '@element-plus/icons-vue'
import { CollectionTag as CommonBookmark } from '@element-plus/icons-vue'
import { Location as CommonLocation } from '@element-plus/icons-vue'
import CommonGlobe from './globe.vue'
import { Calendar as CommonCalendar } from '@element-plus/icons-vue'
import { Clock as CommonTime } from '@element-plus/icons-vue'
import { Document as CommonFile } from '@element-plus/icons-vue'
import { Picture as CommonImage } from '@element-plus/icons-vue'
import { Paperclip as CommonAttachment } from '@element-plus/icons-vue'
import { Message as CommonEmail } from '@element-plus/icons-vue'
import { Filter as CommonFilter } from '@element-plus/icons-vue'
import { Sort as CommonSort } from '@element-plus/icons-vue'
import { SortUp as CommonSortAscending } from '@element-plus/icons-vue'
import { SortDown as CommonSortDescending } from '@element-plus/icons-vue'
import { DArrowLeft as CommonFirst } from '@element-plus/icons-vue'
import { DArrowRight as CommonLast } from '@element-plus/icons-vue'
import CommonExternalLink from './external-link.vue'
import { Link as CommonLink } from '@element-plus/icons-vue'
import { Setting as CommonSettings } from '@element-plus/icons-vue'
export default {
  'arrow-up': { component: ArrowUp },
  'arrow-down': { component: ArrowDown },
  'arrow-left': { component: ArrowLeft },
  'arrow-right': { component: ArrowRight },

  'menu-item': { component: CommonFile },
  add: { component: Icon0 },
  edit: { component: Icon1 },
  delete: { component: Icon2 },
  save: { component: Icon3 },
  cancel: { component: Icon4 },
  confirm: { component: Icon5 },
  search: { component: Icon6 },
  refresh: { component: Icon7 },
  copy: { component: Icon8 },
  upload: { component: Icon9 },
  download: { component: Icon10 },
  close: { component: Icon11 },
  menu: { component: Icon12 },
  more: { component: Icon13 },
  'more-horizontal': { component: Icon13 },
  'more-vertical': { component: MoreVertical },
  previous: { component: Icon14, mirrorInRtl: true },
  next: { component: Icon15, mirrorInRtl: true },
  expand: { component: Icon16 },
  collapse: { component: Icon17 },
  'move-up': { component: ArrowUp },
  'move-down': { component: ArrowDown },
  info: { component: Icon18 },
  success: { component: Icon19 },
  warning: { component: Icon20 },
  error: { component: Icon21 },
  show: { component: Icon22 },
  hide: { component: Icon23 },
  create: { component: Icon0 },
  remove: { component: CommonRemove },
  reset: { component: CommonReset },
  clear: { component: CommonClear },
  retry: { component: CommonRetry },
  home: { component: CommonHome },
  help: { component: CommonHelp },
  bookmark: { component: CommonBookmark },
  location: { component: CommonLocation },
  globe: { component: CommonGlobe },
  calendar: { component: CommonCalendar },
  time: { component: CommonTime },
  file: { component: CommonFile },
  image: { component: CommonImage },
  attachment: { component: CommonAttachment },
  email: { component: CommonEmail },
  filter: { component: CommonFilter },
  sort: { component: CommonSort },
  'sort-ascending': { component: CommonSortAscending },
  'sort-descending': { component: CommonSortDescending },
  first: { component: CommonFirst, mirrorInRtl: true },
  last: { component: CommonLast, mirrorInRtl: true },
  link: { component: CommonLink },
  'external-link': { component: CommonExternalLink },
  settings: { component: CommonSettings },
} satisfies UiIconCatalogue
