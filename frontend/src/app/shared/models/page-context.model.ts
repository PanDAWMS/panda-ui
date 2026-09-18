import { DocTopic } from '../../features/aide/components/docs/docs.model';

export interface PageContext {
  pageTitle: string;
  topics: DocTopic[];
}
