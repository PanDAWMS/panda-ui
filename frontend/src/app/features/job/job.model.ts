export interface Job {
  pandaid: number;
  jedi_task_id: number;
  jobstatus: string | null;
  computingsite: string | null;
  produsername: string | null;

  // timestamps
  creationtime: string;
  starttime: string | null;
  endtime: string | null;
  statechangetime: string | null;
}
