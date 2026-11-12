export interface SplitRuleDefinition {
  parameter: string;
  description: string;
}

export const SPLIT_RULE_DEFINITIONS: Record<string, SplitRuleDefinition> = {
  AE: {
    parameter: 'allowEmptyInput',
    description: 'The task will be allowed to go to finished instead of failed even if the input dataset is empty.',
  },
  AN: {
    parameter: 'addNthFieldToLFN',
    description: 'The task will add the N-th field of the input dataset name to the LFN of the output files.',
  },
  AP: {
    parameter: 'allowPartialFinish',
    description:
      'Jobs in the task will be allowed to go to finished instead of failed even if they don’t process some of the input files successfully.',
  },
  AT: {
    parameter: 'altStageOut',
    description:
      'If set to "on", jobs use the alternative stage-out mechanism for PQs where available. If set to "force", jobs are assigned only to PQs where that mechanism is available.',
  },
  AV: {
    parameter: 'avoidVP',
    description: 'The task will avoid PQs which use Virtual Placement.',
  },
  CC: {
    parameter: 'maxCoreCount',
    description: 'The maximum number of CPU cores that can be used by a single job in the task.',
  },
  CV: {
    parameter: 'cloudAsVO',
    description: 'If set to True, the task will use the cloud attribute as a VO.',
  },
  DE: {
    parameter: 'ddmBackEnd',
    description: 'The DDM backend name to use for the task.',
  },
  DF: {
    parameter: 'disableAutoFinish',
    description: 'If set to True, the task will not automatically go to finished due to timeout.',
  },
  DI: {
    parameter: 'disableReassign',
    description: 'If set to True, jobs in the task will not be automatically reassigned to another PQ due to timeout.',
  },
  DM: {
    parameter: 'debugMode',
    description: 'If set to True, jobs in the task will run in debug mode to send stdout.',
  },
  DR: {
    parameter: 'disableAutoRetry',
    description:
      'If set to True, the task will not automatically retry failed jobs. Internally maxAttempt is set to 1.',
  },
  DY: {
    parameter: 'dynamicNumEvents',
    description: 'The minimum granularity to set the number of events per job dynamically.',
  },
  EC: {
    parameter: 'nEsConsumers',
    description: 'The number of Event Service consumers for each job in the task.',
  },
  EI: {
    parameter: 'nEventsPerInput',
    description: 'The number of events per input file. If set, the n_events metadata in DDM will be ignored.',
  },
  EJ: {
    parameter: 'encJobParams',
    description: 'The job parameters will be encrypted using Base64 encoding when jobs are dispatched.',
  },
  ES: {
    parameter: 'nEventsPerWorker',
    description: 'The number of events per event range defined for Event Service jobs.',
  },
  FC: {
    parameter: 'firstContentsFeed',
    description: '1 if the task does not yet feed input dataset contents to the database, 0 otherwise.',
  },
  FG: {
    parameter: 'failGoalUnreached',
    description: 'The task will go to failed if the goal is not reached.',
  },
  FP: {
    parameter: 'fineGrainedProc',
    description: 'Jobs in the task will keep track of processing using the Event Service mechanism.',
  },
  FT: {
    parameter: 'firstEvent',
    description: 'The first event number to process.',
  },
  FU: {
    parameter: 'fullChain',
    description: 'The task will use the full-chain mechanism to be assigned to the nucleus based on the parent task.',
  },
  GB: {
    parameter: 'groupBoundaryID',
    description: 'The group boundary ID to split input.',
  },
  HO: {
    parameter: 'hpoWorkflow',
    description: 'The task will use the Hyper Parameter Optimization workflow.',
  },
  IA: {
    parameter: 'instantiateTmplSite',
    description: 'The task will instantiate output datasets at each PQ where jobs run.',
  },
  IF: {
    parameter: 'inFilePosEvtNum',
    description: 'The input file has positional event number.',
  },
  IK: {
    parameter: 'ipStack',
    description: 'The IP stack to use for the task: IPv4 or IPv6.',
  },
  IL: {
    parameter: 'allowInputLAN',
    description:
      'If set to "use", the task will allow input files to be directly read over LAN. If set to "only", the task will only read input files over LAN.',
  },
  IM: {
    parameter: 'ignoreMissingInDS',
    description: 'The task will ignore missing input datasets which are deleted after the task is submitted.',
  },
  IN: {
    parameter: 'intermediateTask',
    description: 'The task is an intermediate task in a full-chain.',
  },
  IP: {
    parameter: 'ipConnectivity',
    description: 'The network connectivity requirement for the task: full or http.',
  },
  IS: {
    parameter: 'inputPreStaging',
    description: 'The input of the task will be pre-staged by data carousel.',
  },
  IT: {
    parameter: 'instantiateTmpl',
    description: 'The task will instantiate output datasets using the template datasets.',
  },
  IW: {
    parameter: 'allowInputWAN',
    description: 'The task will allow input files to be directly read over WAN.',
  },
  LC: {
    parameter: 'noLoopingCheck',
    description: 'The task will disable the check for looping jobs.',
  },
  LI: {
    parameter: 'useLocalIO',
    description:
      'The task will always copy input files to scratch disk even if PQs are configured to read input files over LAN.',
  },
  LS: {
    parameter: 'limitedSites',
    description: 'The task will use only limited PQs specified or unspecified in the task.',
  },
  MC: {
    parameter: 'minCpuEfficiency',
    description:
      'The minimum CPU efficiency allowed for the task. If CPU efficiency is lower, the task will go to exhausted.',
  },
  MD: {
    parameter: 'messageDriven',
    description: 'The task will use the message-driven mechanism for internal communication among system components.',
  },
  ME: {
    parameter: 'mergeEsOnOS',
    description: 'The task will merge Event Service outputs on the object store where the output files are stored.',
  },
  MF: {
    parameter: 'nMaxFilesPerJob',
    description: 'The maximum number of input files to be processed by a single job in the task.',
  },
  MJ: {
    parameter: 'maxJumboPerSite',
    description: 'The maximum number of jumbo jobs to be assigned to a single PQ.',
  },
  MN: {
    parameter: 'maxNumJobs',
    description: 'The maximum number of jobs to be generated for a single HPO task.',
  },
  MO: {
    parameter: 'mergeOutput',
    description: 'The task will merge output files.',
  },
  MS: {
    parameter: 'multiStepExec',
    description: 'Each job in the task will execute the payload in multiple steps.',
  },
  MW: {
    parameter: 'maxWalltime',
    description: 'The maximum walltime for a single job in the task, in hours.',
  },
  MX: {
    parameter: 'maxEventsPerJob',
    description:
      'The maximum number of events to be processed by a single job when the number of events is set dynamically.',
  },
  NC: {
    parameter: 'noExecStrCnv',
    description: 'The pilot does not convert the execution string when executing the payload.',
  },
  ND: {
    parameter: 'notDiscardEvents',
    description: 'The task will not discard events when retrying Event Service jobs.',
  },
  NE: {
    parameter: 'nEventsPerJob',
    description: 'The number of events to be processed by a single job in the task.',
  },
  NF: {
    parameter: 'nFilesPerJob',
    description: 'The number of input files to be processed by a single job in the task.',
  },
  NG: {
    parameter: 'nGBPerJob',
    description: 'The maximum input size in GB to be processed by a single job in the task.',
  },
  NI: {
    parameter: 'noInputPooling',
    description: 'The task will not use input pooling, so it will generate a job as soon as one input is ready.',
  },
  NJ: {
    parameter: 'nJumboJobs',
    description: 'The number of jumbo jobs to be generated for the task.',
  },
  NS: {
    parameter: 'nSitesPerJob',
    description: 'The number of PQs to be used for a group of Event Service consumers.',
  },
  NT: {
    parameter: 'nChunksToWait',
    description: 'The number of chunks to wait before generating jobs.',
  },
  NW: {
    parameter: 'noWaitParent',
    description:
      'The task will not wait for the parent task to finish and will start processing while the parent task is running.',
  },
  OI: {
    parameter: 'orderInputBy',
    description: 'The input files will be ordered by the specified attribute.',
  },
  OL: {
    parameter: 'orderByLB',
    description: 'The input files will be ordered by the lumi block number.',
  },
  OM: {
    parameter: 'onSiteMerging',
    description: 'The task will merge output files on the PQ where the output files are stored.',
  },
  OS: {
    parameter: 'osMatching',
    description: 'The task will require operating system matching for the PQs.',
  },
  OT: {
    parameter: 'onlyTagsForFC',
    description: 'The task will use only tag matching in the brokerage to run the fat container.',
  },
  PC: {
    parameter: 'pushStatusChanges',
    description: 'The task will push status changes to the message broker.',
  },
  PJ: {
    parameter: 'pushJob',
    description: 'The task will push a job to the pilot through the message broker.',
  },
  PL: {
    parameter: 'pfnList',
    description: 'The task will use the PFN list to specify input files.',
  },
  PO: {
    parameter: 'putLogToOS',
    description: 'Jobs in the task will upload log files to the object store.',
  },
  RC: {
    parameter: 'runUntilClosed',
    description: 'The task will keep running until the input dataset is closed.',
  },
  RD: {
    parameter: 'registerDatasets',
    description: 'The task will register the output datasets in DDM.',
  },
  RE: {
    parameter: 'registerEsFiles',
    description: 'The task will register Event Service output files in DDM.',
  },
  RL: {
    parameter: 'respectLB',
    description:
      'The task will respect the lumi block number when generating jobs, so each job processes files with the same lumi block number.',
  },
  RM: {
    parameter: 'retryModuleRules',
    description: 'The list of task parameters and their initial values modified by the retry module.',
  },
  RO: {
    parameter: 'reuseSecOnDemand',
    description:
      'The task will reuse secondary datasets if they are insufficient in comparison to the primary dataset.',
  },
  RP: {
    parameter: 'releasePerLB',
    description: 'The task will generate jobs when all input files with the same lumi block number are ready.',
  },
  RR: {
    parameter: 'respectSplitRule',
    description: 'Scout jobs in the task will respect the splitRule attribute of the task when they are generated.',
  },
  RS: {
    parameter: 'randomSeed',
    description: 'The random seed to be used for the task.',
  },
  RX: {
    parameter: 'retryRamOffset',
    description: 'The offset to be added to the RAM size of the job when the retry module changes memory requirements.',
  },
  RY: {
    parameter: 'retryRamStep',
    description: 'The step to be added to the RAM size of the job when the retry module changes memory requirements.',
  },
  SC: {
    parameter: 'resurrectConsumers',
    description: 'The task will resurrect Event Service consumers.',
  },
  SE: {
    parameter: 'switchEStoNormal',
    description:
      'The task will switch Event Service jobs to normal jobs if the remaining number of events is less than the threshold.',
  },
  SO: {
    parameter: 'stayOutputOnSite',
    description: 'The task will keep the output files on the PQ where the output files are stored.',
  },
  SS: {
    parameter: 'scoutSuccessRate',
    description: 'The success rate of scout jobs to be satisfied in the task.',
  },
  ST: {
    parameter: 'useSecrets',
    description: 'Jobs in the task will use secrets stored in PanDA.',
  },
  SW: {
    parameter: 'segmentedWork',
    description: 'The workload in the task is segmented so that jobs are generated for each segment.',
  },
  TJ: {
    parameter: 'totNumJobs',
    description: 'The maximum number of jobs to be generated for the task.',
  },
  TN: {
    parameter: 'tgtMaxOutputForNG',
    description: 'The maximum output size in GB targeted for a single job when nGBPerJob is set.',
  },
  TW: {
    parameter: 't1Weight',
    description: 'The weight in the brokerage to assign jobs to nuclei. -1 assigns all jobs to the nucleus.',
  },
  UB: {
    parameter: 'useBuild',
    description: 'The task will use a build job followed by multiple run jobs.',
  },
  UC: {
    parameter: 'useJobCloning',
    description:
      'The task will use job cloning to process the same payload with multiple jobs. "runonce" kills other jobs when one takes the payload; "storeonce" kills other jobs when one successfully uploads the output.',
  },
  UE: {
    parameter: 'useRealNumEvents',
    description:
      'The task will use the real number of events for each input file available as n_events metadata in DDM.',
  },
  UF: {
    parameter: 'useFileAsSourceLFN',
    description: 'The task will use part of the input file name as the source LFN of the output files.',
  },
  UP: {
    parameter: 'usePrePro',
    description: 'The task will run the pre-processing job to process the actual payload.',
  },
  US: {
    parameter: 'useScout',
    description:
      'The task will run scout jobs with a small fraction of input files before generating jobs for all the rest.',
  },
  UT: {
    parameter: 'usePrefetcher',
    description: 'Jobs in the task will use the prefetcher to download input files.',
  },
  UX: {
    parameter: 'useExhausted',
    description: 'The task will go to exhausted if the task is finished incompletely.',
  },
  UZ: {
    parameter: 'useZipToPin',
    description: 'The task will use zip datasets to pin input files.',
  },
  WF: {
    parameter: 'writeInputToFile',
    description:
      'Jobs in the task will write input file names to a file and pass it to the payload to avoid a long argument list.',
  },
  WI: {
    parameter: 'waitInput',
    description: 'The task will wait for the input dataset before it is registered in DDM.',
  },
  XA: {
    parameter: 'maxAttemptES',
    description: 'The maximum number of attempts for an event range.',
  },
  XF: {
    parameter: 'decAttOnFailedES',
    description: 'Event Service jobs in the task will decrease the number of attempts when they fail.',
  },
  XJ: {
    parameter: 'maxAttemptEsJob',
    description: 'The maximum number of attempts for Event Service jobs.',
  },
  ZE: {
    parameter: 'nEventsPerMergeJob',
    description: 'The number of events to be processed by a single merge job.',
  },
  ZF: {
    parameter: 'nFilesPerMergeJob',
    description: 'The number of input files to be processed by a single merge job.',
  },
  ZG: {
    parameter: 'nGBPerMergeJob',
    description: 'The maximum input size in GB to be processed by a single merge job.',
  },
  ZM: {
    parameter: 'nMaxFilesPerMergeJob',
    description: 'The maximum number of input files to be processed by a single merge job.',
  },
};
