import { PaginationQueryParams } from '../../shared/models/pagination.model';

export interface WorkflowItem {
  workflow_id: number;
  name: string;
  status: string | null;
  creation_time: string;
  start_time: string | null;
  end_time: string | null;
  total_steps: number;
  pending_steps: number;
  active_steps: number;
  completed_steps: number;
  failed_steps: number;
}

export interface StepDetail {
  step_id: number;
  name: string | null;
  member_id: number;
  type: string | null;
  status: string | null;
  flavor: string | null;
  target_id: string | null;
  creation_time: string | null;
  start_time: string | null;
  end_time: string | null;
  modification_time: string | null;
  check_time: string | null;
  locked_by: string | null;
  lock_time: string | null;
  definition_json: StepDefinition;
  parameters: string | null;
}

export interface StepDefinition {
  id: number;
  member_id: number;
  name: string;
  type: string;
  is_leaf: boolean;
  is_head: boolean;
  is_tail: boolean;
  parents: number[];
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

export interface DataDetail {
  data_id: number;
  name: string;
  status: string;
  type: string;
  creation_time: string;
  modification_time: string;
}

export interface WorkflowDetail extends WorkflowItem {
  description: string | null;
  modification_time: string;
  steps: StepDetail[];
  data_items: DataDetail[];
  file_summary?: {
    datasets_count: number;
    files_total: number;
    files_finished: number;
    files_failed: number;
    files_missing: number;
    files_waiting: number;
  };
}

export interface WorkflowQueryParams extends PaginationQueryParams {
  name?: string;
  status?: string;
  type?: string;
  creation_time?: string;
  start_time?: string | null;
  [key: string]: unknown;
}
