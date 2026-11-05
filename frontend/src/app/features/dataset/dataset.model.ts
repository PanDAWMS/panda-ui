import { StatusCount } from '../../shared/models/status.model';

export type DatasetItem = {
  jeditaskid: number;
  datasetid: number;
  datasetname: string;
  type: string;
  creationtime: string;
  modificationtime: string;
  masterid: number | null;
  containername: string;
  status: string;
  state: string;
  nfiles: number | null;
  nfilestobeused: number | null;
  nfilesused: number | null;
  nfilesfinished: number | null;
  nfilesfailed: number | null;
  nfilesonhold: number | null;
  nfileswaiting: number;
  nfilesmissing: number;
  nevents: number | null;
  neventstobeused: number | null;
  neventsused: number | null;
};

export type InputSummary = {
  counts: StatusCount[];
  total: number;
  progress: number;
};

export type InputGroup = {
  name: string | null;
  summary: InputSummary;
};

export type OutputGroup = {
  name: string | null;
  datasets: number;
  files: number;
};
