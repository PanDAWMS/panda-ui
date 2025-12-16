export type Task = {
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
  workqueue_id?: number;
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
  lockedtime?: string; // ISO string for DateTime

  // timestamps
  creationdate: string; // ISO string
  starttime?: string;
  endtime?: string;
  frozentime?: string;
  statechangetime?: string;
  resquetime?: string;
  modificationtime: string;

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
};
