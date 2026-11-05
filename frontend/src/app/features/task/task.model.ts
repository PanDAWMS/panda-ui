import { PaginationQueryParams } from '../../shared/models/pagination.model';
import { MultiselectOption } from '../../shared/models/option.model';

export const PENDING_STATUSES = ['registered', 'defined', 'pending', 'ready', 'paused'] as const;

export const ACTIVE_STATUSES = ['assigning', 'scouting', 'running', 'staging', 'exhausted', 'throttled'] as const;

export const TRANSITION_STATUSES = [
  'scouted',
  'prepared',
  'starting',
  'aborting',
  'finishing',
  'tobroken',
  'toretry',
  'toincexec',
  'rerefine',
  'topreprocess',
  'preprocessing',
  'staged',
] as const;

export const FINAL_STATUSES = ['done', 'finished', 'failed', 'cancelled', 'aborted', 'broken'] as const;
export const TASK_STATUSES = [
  ...PENDING_STATUSES,
  ...ACTIVE_STATUSES,
  ...TRANSITION_STATUSES,
  ...FINAL_STATUSES,
] as const;
export const TASK_STATUS_OPTIONS: MultiselectOption[] = [
  ...PENDING_STATUSES,
  ...ACTIVE_STATUSES,
  ...FINAL_STATUSES,
].map((status) => ({
  label: status,
  value: status,
}));
export const TASK_TYPE_OPTIONS: MultiselectOption[] = ['anal', 'prod'].map((k) => ({
  label: k,
  value: k,
}));

export type TaskItemDetail = {
  jeditaskid: number;
  taskname: string;
  status: string;
  superstatus?: string;
  username: string;
  reqid?: number;
  site?: string;
  prodsourcelabel?: string;
  workinggroup?: string;
  vo?: string;
  tasktype?: string;
  processingtype?: string;
  framework?: string;
  architecture?: string;
  transuses?: string;
  transhome?: string;
  transpath?: string;
  termcondition?: string;
  splitrule?: string;
  errordialog?: string;
  parent_tid?: number;
  eventservice?: number;
  campaign?: string;
  gshare?: string;
  nucleus?: string;
  requesttype?: string;
  resourcetype?: string;
  usejumbo?: string;
  container_name?: string;
  currentpriority?: number;
  taskpriority?: number;
  corecount?: number;
  attemptnr?: number;
  lockedby?: string;

  // timestamps - ISO string
  creationdate: string;
  starttime?: string;
  endtime?: string;
  frozentime?: string;
  statechangetime?: string;
  resquetime?: string;
  modificationtime: string;
  lockedtime?: string;

  // job related metrics
  walltime?: number;
  walltimeunit?: string;
  outdiskcount?: number;
  outdiskunit?: string;
  workdiskcount?: number;
  workdiskunit?: string;
  ramcount?: number;
  ramunit?: string;
  iointensity?: number;
  iointensityunit?: string;
  diskio?: number;
  diskiounit?: string;
  basewalltime?: number;
  cputime?: number;
  cputimeunit?: string;
  cpuefficiency?: number;
  memoryleakcore?: number;
  memoryleakx2?: number;

  // files counts
  files_total: number;
  files_finished: number;
  files_failed: number;
  files_missing: number;
};

export type TaskFieldsLight =
  | 'jeditaskid'
  | 'taskname'
  | 'status'
  | 'username'
  | 'processingtype'
  | 'framework'
  | 'currentpriority'
  | 'creationdate'
  | 'modificationtime'
  | 'files_total'
  | 'files_finished'
  | 'files_failed'
  | 'files_missing';

export type TaskItem = Pick<TaskItemDetail, TaskFieldsLight>;

export type TaskQueryParams = PaginationQueryParams &
  Partial<
    Pick<
      TaskItemDetail,
      'jeditaskid' | 'taskname' | 'status' | 'username' | 'tasktype' | 'processingtype' | 'framework' | 'creationdate'
    >
  > & {
    [key: string]: unknown;
  };

type TaskDetailField = {
  key: keyof TaskItemDetail;
  label: string;
  value: unknown;
  url?: string;
  class?: string;
};

export type TaskDetailSection = {
  title: string;
  fields: TaskDetailField[];
};
