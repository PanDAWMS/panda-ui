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

export type BaseSummary = {
  containers: number;
  datasets: number;
  files: number;
};

export type OutputSummary = BaseSummary;

export type InputSummary = BaseSummary & {
  progress: number;
  counts: StatusCount[];
};

export interface DatasetGroup {
  name: string;
  type: 'container' | 'dataset' | 'collection';
  children: DatasetGroup[];
  summary: InputSummary | OutputSummary;
}
